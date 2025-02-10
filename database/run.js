import { faker } from '@faker-js/faker';
import neo4j from 'neo4j-driver';
import crypto from 'crypto';

// Initialize Faker with multiple locales
faker.locale = 'en';

// Configuration
const NEO4J_URI = "neo4j://localhost:7687";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "kjod876fytf";
const TOTAL_USERS = 100;

// Cities and their coordinates
const CITIES = {
    'Khouribga': { x: -6.9081, y: 32.8770 },
    'Fes': { x: -5.0033, y: 34.0333 },
    'Casablanca': { x: -7.5898, y: 33.5731 },
    'Tangier': { x: -5.8129, y: 35.7595 },
    'Settat': { x: -7.6166, y: 32.9833 }
};

// Interests
const INTERESTS = [
    "#Photography", "#Shopping", "#Karaoke", "#Yoga", "#Cooking",
    "#Tennis", "#Art", "#Traveling", "#Music", "#Gaming",
    "#Swimming", "#Running", "#Painting", "#Drawing", "#Sculpture",
    "#Poetry", "#Writing", "#Theater", "#Dance", "#Museums"
];

class PhotoManager {
    constructor() {
        this.photos = {
           

            'male': [
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            ] 
            ,
            'female': [
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            ]
        };
    }

    async ensurePhotos(gender, needed) {
        const photos = this.photos[gender] || [];
        if (photos.length === 0) return Array(needed).fill("");
        return Array.from({ length: needed }, () => photos[Math.floor(Math.random() * photos.length)]);
    }
}

class UserGenerator {
    constructor(photoManager) {
        this.photoManager = photoManager;
    }

    generatePasswordHash() {
        return `$argon2id$v=19$m=65536,t=3,p=4$${crypto.randomBytes(20).toString('hex')}$${crypto.randomBytes(32).toString('hex')}`;
    }

    generateUserInterests() {
        const count = Math.floor(Math.random() * 6) + 5; // 5-10 interests
        return INTERESTS.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    async generateUser(index) {
        const gender = Math.random() < 0.5 ? 'male' : 'female';
        const cityNames = Object.keys(CITIES);
        const city = cityNames[Math.floor(Math.random() * cityNames.length)];
        const coords = CITIES[city];
        
        const x = coords.x + (Math.random() * 0.01 - 0.005);
        const y = coords.y + (Math.random() * 0.01 - 0.005);
        
        const photos = await this.photoManager.ensurePhotos(gender, 1);
        const profilePic = photos.length > 0 ? photos[0] : "";

        return {
            username: `user_${crypto.createHash('md5').update(index.toString()).digest('hex').substring(0, 8)}`,
            email: faker.internet.email(),
            password: this.generatePasswordHash(),
            first_name: gender === 'male' ? faker.person.firstName('male') : faker.person.firstName('female'),
            last_name: faker.person.lastName(),
            age: Math.floor(Math.random() * 3) + 18, // 18-20
            gender: gender,
            city: city,
            country: 'Morocco',
            biography: faker.lorem.sentence(20),
            profile_picture: profilePic,
            pics: [profilePic, ...Array(4).fill("")],
            interests: this.generateUserInterests(),
            x: x,
            y: y,
            setup_done: true,
            verified: true,
            is_logged: Math.random() < 0.5,
            fame_rating: Math.floor(Math.random() * 101)
        };
    }
}

class DatabaseManager {
    constructor() {
        this.driver = neo4j.driver(
            NEO4J_URI,
            neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
        );
    }

    async populateDatabase(userGenerator) {
        const session = this.driver.session();
        
        try {
            console.log("Clearing existing database...");
            await session.run("MATCH (n) DETACH DELETE n");

            console.log(`Generating ${TOTAL_USERS} users...`);
            for (let i = 0; i < TOTAL_USERS; i++) {
                const user = await userGenerator.generateUser(i);

                // Create user node
                await session.run(`
                    CREATE (u:User {
                        username: $username,
                        email: $email,
                        password: $password,
                        first_name: $first_name,
                        last_name: $last_name,
                        age: $age,
                        gender: $gender,
                        city: $city,
                        country: $country,
                        city_WTK: $city,
                        country_WTK: $country,
                        biography: $biography,
                        location_WTK: point({latitude: $y, longitude: $x}),
                        location: point({latitude: $y, longitude: $x}),
                        profile_picture: $profile_picture,
                        pics: $pics,
                        setup_done: $setup_done,
                        verified: $verified,
                        is_logged: $is_logged,
                        fame_rating: $fame_rating,
                        notifications: []
                    })
                `, user);

                // Create interests relationships
                for (const interest of user.interests) {
                    await session.run(`
                        MATCH (u:User {username: $username})
                        MERGE (t:Tags {interests: $interest})
                        MERGE (u)-[:has_this_interest]->(t)
                    `, { username: user.username, interest });
                }

                if ((i + 1) % 10 === 0) {
                    console.log(`Progress: ${i + 1}/${TOTAL_USERS} users created`);
                }
            }

            await this.printStatistics(session);
        } finally {
            await session.close();
        }
    }

    async printStatistics(session) {
        const userCount = await session.run("MATCH (u:User) RETURN count(u) as count");
        const tagCount = await session.run("MATCH (t:Tags) RETURN count(t) as count");
        const relCount = await session.run("MATCH ()-[r:has_this_interest]->() RETURN count(r) as count");

        console.log("\nDatabase Statistics:");
        console.log(`Total Users: ${userCount.records[0].get('count')}`);
        console.log(`Total Unique Interests: ${tagCount.records[0].get('count')}`);
        console.log(`Total Interest Relationships: ${relCount.records[0].get('count')}`);
    }

    close() {
        return this.driver.close();
    }
}

async function main() {
    console.log("Starting database population process...");
    try {
        const photoManager = new PhotoManager();
        const userGenerator = new UserGenerator(photoManager);
        const dbManager = new DatabaseManager();

        await dbManager.populateDatabase(userGenerator);
        dbManager.close();

        console.log("Database population completed successfully!");
    } catch (e) {
        console.error("Fatal error:", e);
        process.exit(1);
    }
}

main().catch(console.error);