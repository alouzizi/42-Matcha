import express from 'express';
import { driver } from '../database';

const userStatus = express.Router();

userStatus.get('/user-status/:username', async (req, res) => {
	const session_db = driver.session();
	try {
	  const { username } = req.params;
	  
	  // Add debug logging
	  
	  const result = await session_db.run(
		`MATCH (u:User {username: $username})
		 RETURN u.lastSeen as lastSeen`,
		{ username }
	  );
	  
	  if (result.records.length > 0) {
		const lastSeen = result.records[0].get('lastSeen');
		
		// Debug log the raw value
		
		let parsedLastSeen = null;
		
		if (lastSeen) {
		  // Handle different possible formats of lastSeen
		  if (lastSeen.toString().includes('T')) {
			// If it's a datetime string
			parsedLastSeen = new Date(lastSeen).getTime();
		  } else {
			// If it's a number/timestamp
			parsedLastSeen = parseInt(lastSeen.toString());
		  }
		  
		  // Validate the parsed timestamp
		  if (isNaN(parsedLastSeen) || parsedLastSeen <= 0) {
			parsedLastSeen = null;
		  }
		}
		
		// Debug log the parsed value
		
		res.json({
		  username,
		  isOnline: false,
		  lastSeen: parsedLastSeen
		});
	  } else {
		res.status(404).json({ error: 'User not found' });
	  }
	} catch (error) {
	  console.error('Error fetching user status:', error);
	  res.status(500).json({ error: 'Failed to fetch user status' });
	} finally {
	  await session_db.close();
	}
  });

  export default userStatus;