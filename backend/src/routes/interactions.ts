import express, { response } from "express";
import neo4j from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";

const interactions = express.Router();

const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username as string, process.env.database_password as string)
);

interactions.post("/like-user", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;
  const username = user.username;
  const { likedUsername } = req.body;

  const session = driver.session();
  try {
    const result = await session.run(
      `
		MATCH (u:User {username: $username})
		MATCH (otherUser:User {username: $likedUsername})
		WHERE u <> otherUser
		MERGE (u)-[r:LIKES {createdAt: datetime()}]->(otherUser)
		WITH u, otherUser, EXISTS((otherUser)-[:LIKES]->(u)) as isMatch
		
		FOREACH(x IN CASE WHEN isMatch THEN [1] ELSE [] END |
			MERGE (u)-[m:MATCHED {createdAt: datetime()}]-(otherUser)
		)
		
		RETURN {
			liked: true, 
			isMatch: isMatch,
			matchedAt: CASE WHEN isMatch THEN datetime() ELSE null END
		} as result`,
      { username, likedUsername }
    );

    if (result.records.length > 0) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: "Failed to like user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});



interactions.post("/blocks/:username", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;
  const username = user.username;

  const blockedUsername = req.params.username;

  const session = driver.session();
  try {
	const result = await session.run(
		`
		MATCH (u:User {username: $username}), 
			  (blockedUser:User {username: $blockedUsername})
		WHERE u <> blockedUser
		MERGE (u)-[b:BLOCKED {
			createdAt: datetime()
		}]->(blockedUser)
		WITH u, blockedUser
		OPTIONAL MATCH (u)-[l:LIKES]->(blockedUser)
		OPTIONAL MATCH (u)-[m:MATCHED]-(blockedUser)
		DELETE l, m
		RETURN true as blocked
		`,
		{ username, blockedUsername }
	  );
    return res.status(200).json({
      success: true,
      blocked: result.records[0].get("blocked"),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Failed to block user" });
  } finally {
    await session.close();
  }
});


interactions.delete("/blocks/:username", authenticateToken_Middleware, async (req: any, res: any) => {
	if (!req.user) {
	  return res.status(401).json({ error: "Unauthorized" });
	}
  
	const user = req.user;
	const username = user.username;
	const unblockedUsername = req.params.username;
  
	const session = driver.session();
	try {
	  const result = await session.run(
		`
		MATCH (u:User {username: $username})-[b:BLOCKED]->(blockedUser:User {username: $unblockedUsername})
		DELETE b
		RETURN {
		  unblocked: true,
		  unblockedUser: blockedUser.username
		} as result
		`,
		{ username, unblockedUsername }
	  );
  
	  if (result.records.length === 0) {
		return res.status(404).json({
		  success: false,
		  error: "Block relationship not found"
		});
	  }
  
	  return res.status(200).json({
		success: true,
		data: result.records[0].get('result')
	  });
  
	} catch (error) {
	  console.log(error);
	  return res.status(500).json({ 
		success: false, 
		error: "Failed to unblock user" 
	  });
	} finally {
	  await session.close();
	}
  });



  interactions.post("/reports/:username", authenticateToken_Middleware, async (req: any, res: any) => {
	if (!req.user) {
	  return res.status(401).json({ error: "Unauthorized" });
	}
  
	const user = req.user;
	const username = user.username;
	const reportedUsername = req.params.username;
	

	const reason = "FAKE_ACCOUNT";
  
	const session = driver.session();
	try {
	  const result = await session.run(
		`
		MATCH (reporter:User {username: $username}), 
			  (reportedUser:User {username: $reportedUsername})
		WHERE reporter <> reportedUser
		MERGE (reporter)-[r:REPORTED {
		  createdAt: datetime()
		}]->(reportedUser)
		RETURN {
		  reported: true,
		  reportedUser: reportedUser.username,
		  reportId: id(r),
		  status: r.status,
		  createdAt: r.createdAt
		} as result
		`,
		{ 
		  username, 
		  reportedUsername, 
		  reason, 
		}
	  );
  
	  return res.status(200).json({
		success: true,
		data: result.records[0].get('result')
		});
  
	} catch (error) {
		console.log(error);
		return res.status(500).json({ 
			success: false, 
			error: "Failed to report user" 
	  });
	} finally {
	  await session.close();
	}
  });

  

export default interactions;