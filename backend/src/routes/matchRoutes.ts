import express, { response } from "express";
// import { driver, Driver } from 'neo4j-driver';
import neo4j, { int } from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";


const match = express.Router();

const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username as string, process.env.database_password as string)
);


match.get("/matches", authenticateToken_Middleware, async (req: any, res: any) => {
if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
}


const session = driver.session();
  try {
      const result = await session.run(
          `
          MATCH (u:User {username: $username})
          MATCH (otherUser:User)
          WHERE (u)-[:MATCHED]-(otherUser)
          RETURN otherUser
          `,
          { username: req.user.username }
      );

      const matches = result.records.map((record) => {
          const user = record.get("otherUser");
          return {
              id: user.identity.low,
              username: user.properties.username,
              name: `${user.properties.first_name} ${user.properties.last_name}`,
              age: user.properties.age,
              // distance: ,
              profile_picture: user.properties.pics.slice(0, 1),
              preview: {
                  bio: user.properties.biography.substring(0, 100) + "..."
              },
              interests: user.properties.interests,
              isOnline: true,
          };
      });

      return res.status(200).json({
          success: true,
          data: matches,
          count: matches.length
      });

  } catch (error) {}
  finally {
      await session.close();
  }
});


match.post("/like-user", authenticateToken_Middleware, async (req: any, res: any) => {
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

export default match;


match.post("/potential-matches", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    minAge = 18,
    maxAge = 100,
    minCommonTags = 0,
    filterTags = [],
    minFame = 0,
    maxFame = 100,
    maxDistance = 100,
    sortBy = 'distance',
    page = 1,
    limit = 10
  } = req.body;

  const params = {
    username: req.user.username,
    minAge: Math.floor(Number(minAge)),
    maxAge: Math.floor(Number(maxAge)),
    minCommonTags: Math.floor(Number(minCommonTags)),
    filterTags: Array.isArray(filterTags) ? filterTags : [],
    minFame: Math.floor(Number(minFame)),
    maxFame: Math.floor(Number(maxFame)),
    maxDistance: Math.floor(Number(maxDistance)),
    sortBy: String(sortBy),
    skip: Math.max(0, Math.floor(Number(page) - 1)) * Math.floor(Number(limit)),
    limit: Math.floor(Number(limit))
  };

  // Validation checks
  if (params.minAge < 18 || params.maxAge > 100 || params.minAge > params.maxAge) {
    return res.status(400).json({ error: "Invalid age range" });
  }

  if (params.minFame < 0 || params.maxFame > 100 || params.minFame > params.maxFame) {
    return res.status(400).json({ error: "Invalid fame range" });
  }

  if (params.maxDistance < 0 || params.maxDistance > 20000) { // 20000km is roughly half Earth's circumference
    return res.status(400).json({ error: "Invalid distance range" });
  }

  if (params.limit <= 0 || params.limit > 50) {
    params.limit = 10;
  }

  const query = `
  MATCH (u:User {username: $username})
  MATCH (otherUser:User)
  WHERE otherUser.username <> u.username 
  AND otherUser.gender <> u.gender
  AND otherUser.age >= $minAge 
  AND otherUser.age <= $maxAge
  AND otherUser.fame_rating >= $minFame
  AND otherUser.fame_rating <= $maxFame
  AND NOT (u)-[:LIKES]->(otherUser)
  AND NOT (u)-[:BLOCKED]->(otherUser)

  // Calculate distance between users using point distance
  WITH u, otherUser,
       point.distance(u.location_WTK, otherUser.location_WTK) / 1000 as distance // Convert to kilometers

  WHERE distance <= $maxDistance

  OPTIONAL MATCH (otherUser)-[r:has_this_interest]->(t:Tags)
  WITH otherUser, u, distance, COLLECT(DISTINCT t.interests) as otherUserInterests

  OPTIONAL MATCH (u)-[:has_this_interest]->(userTags:Tags)
  WHERE userTags.interests IN otherUserInterests

  WITH otherUser,
       otherUserInterests as interests,
       COUNT(DISTINCT userTags) as commonTags,
       distance

  WHERE
      CASE
          WHEN $minCommonTags > 0 THEN commonTags >= $minCommonTags
          ELSE true
      END
  AND
      CASE
          WHEN size($filterTags) > 0 THEN
              ANY(tag IN interests WHERE tag IN $filterTags)
          ELSE true
      END

  RETURN
      otherUser,
      interests,
      commonTags,
      distance,
      otherUser.age as age,
      otherUser.fame_rating as fameRating

  ORDER BY
      CASE $sortBy
          WHEN 'common_tags' THEN -commonTags  // Using negative to reverse the sort order for common tags
          WHEN 'distance' THEN distance
          WHEN 'age' THEN otherUser.age
          WHEN 'fame' THEN otherUser.fame_rating
          ELSE distance
      END ASC
  
  SKIP toInteger($skip)
  LIMIT toInteger($limit)
`;

  const session = driver.session();
  try {
    const result = await session.run(query, params);

    const profiles = result.records.map((record) => {
      const user = record.get("otherUser");
      const interests = record.get("interests");
      const commonTags = record.get("commonTags").low;
      const distance = Math.round(record.get("distance"));

      return {
        id: user.identity.low,
        username: user.properties.username,
        name: `${user.properties.first_name} ${user.properties.last_name}`,
        age: user.properties.age,
        distance: distance,
        pics: user.properties.pics.slice(0, 1),
        commonTags: commonTags,
        preview: {
          interests: interests.slice(0, 3),
          bio: user.properties.biography.substring(0, 100) + "..."
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: profiles,
      count: profiles.length,
      pagination: {
        page: Math.floor(Number(page)),
        limit: params.limit,
        hasMore: profiles.length === params.limit
      }
    });
  } catch (error) {
    console.error("Error in potential-matches:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});


match.get("/profile/:username", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
  }

  const username = req.params.username;
  const session = driver.session();

  try {
      const query = `
          MATCH (user:User {username: $username})
          OPTIONAL MATCH (user)-[:has_this_interest]->(t:Tags)
          WITH user, COLLECT(DISTINCT t.interests) as interests
          
          // Calculate profile completeness
          WITH user, interests,
               CASE 
                  WHEN user.profile_picture IS NOT NULL THEN 20 ELSE 0 END +
                  CASE WHEN user.biography IS NOT NULL AND size(user.biography) > 50 THEN 20 ELSE 0 END +
                  CASE WHEN size(interests) > 2 THEN 20 ELSE 0 END +
                  CASE WHEN user.occupation IS NOT NULL THEN 20 ELSE 0 END +
                  CASE WHEN user.location IS NOT NULL THEN 20 ELSE 0 END as profile_completeness
          
          RETURN user, 
                 interests,
                 profile_completeness,
                 user.points as points,
                 user.fame_rating as fame_rating
      `;

      const result = await session.run(query, { username });
      
      if (result.records.length === 0) {
          return res.status(404).json({ error: "Profile not found" });
      }

      const record = result.records[0];
      const user = record.get("user");
      const interests = record.get("interests");
      const profile_completeness = record.get("profile_completeness").low;
      const points = record.get("points")?.low || 0;
      const fame_rating = record.get("fame_rating")?.low || 0;

      return res.status(200).json({
          success: true,
          data: {
              username: user.properties.username,
              first_name: user.properties.first_name,
              last_name: user.properties.last_name,
              age: user.properties.age,
              gender: user.properties.gender,
              biography: user.properties.biography,
              location: user.properties.location,
              distance: user.properties.distance,
              profile_picture: user.properties.profile_picture,
              pics: user.properties.pics,
              interests: interests,
              fame_rating: fame_rating,
              city: user.properties.city,
          }
      });
  } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  } finally {
      await session.close();
  }
});