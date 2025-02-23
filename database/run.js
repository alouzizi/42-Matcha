// import { faker } from "@faker-js/faker";
// import neo4j from "neo4j-driver";
// import argon2 from "argon2";

const { faker } = require("@faker-js/faker");
const neo4j = require("neo4j-driver");
const argon2 = require("argon2");
const dotenv = require("dotenv");



// import dotenv from "dotenv";
dotenv.config();


async function populateNeo4jDatabase() {
  // Configuration
  const NEO4J_URI = process.env.database_URL;
  const NEO4J_USER = process.env.database_username;
  const NEO4J_PASSWORD = process.env.database_password
  const TOTAL_USERS = 500


  const CITIES = {
    Khouribga: { x: -6.9081, y: 32.877 },
    Casa: { x: -7.5898, y: 33.5731 },
  };

  // Extended interests list
  const INTERESTS = [
    "#Photography",
    "#Shopping",
    "#Yoga",
    "#Cooking",
    "#Tennis",
    "#Art",
    "#Traveling",
    "#Music",
    "#Gaming",
    "#Swimming",
    "#Running",
    "#Painting",
    "#Poetry",
    "#Writing",
    "#Museums",
    "#Hiking",
    "#Reading",
    "#Chess",
  ];

  // Extended photo collections
  const PHOTOS = {
    male: [
      "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/10479493/pexels-photo-10479493.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/16457464/pexels-photo-16457464/free-photo-of-bearded-man-wearing-eyeglasses.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/3760258/pexels-photo-3760258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/16973769/pexels-photo-16973769/free-photo-of-portrait-of-a-laughing-man.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30587051/pexels-photo-30587051/free-photo-of-portrait-of-a-mature-mechanic-in-a-dimly-lit-garage.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30612850/pexels-photo-30612850/free-photo-of-outdoor-portrait-of-a-man-relaxing-on-swing-in-abuja.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30602305/pexels-photo-30602305/free-photo-of-portrait-of-a-man-in-traditional-attire-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30630920/pexels-photo-30630920/free-photo-of-urban-fashion-portrait-of-pensive-man.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/6147211/pexels-photo-6147211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30644130/pexels-photo-30644130/free-photo-of-stylish-portrait-of-a-man-in-hooded-sweatshirt.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30629084/pexels-photo-30629084/free-photo-of-young-man-in-casual-attire-on-metro-stairway.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/28314088/pexels-photo-28314088/free-photo-of-a-man-in-a-blue-shirt-and-glasses-standing-in-front-of-a-building.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30623852/pexels-photo-30623852/free-photo-of-moody-portrait-of-youth-in-urban-fashion.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/6976091/pexels-photo-6976091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30630789/pexels-photo-30630789/free-photo-of-vintage-style-portrait-with-old-cassette-player.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30299380/pexels-photo-30299380/free-photo-of-man-in-black-coat-leaning-against-tree-in-fall.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/17077069/pexels-photo-17077069/free-photo-of-birds-eye-view-of-motorboat.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30446427/pexels-photo-30446427/free-photo-of-stylish-man-in-suit-posing-on-rocky-terrain.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/29580987/pexels-photo-29580987/free-photo-of-elderly-man-walking-in-tokyo-neighborhood.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/29690236/pexels-photo-29690236/free-photo-of-contemplative-man-in-red-light-portrait.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",

      "https://images.pexels.com/photos/30158553/pexels-photo-30158553/free-photo-of-stylish-young-adult-in-trendy-denim-outfit.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFuJTIwJTIwcG90cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWFuJTIwJTIwcG90cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1738949539165-1afd5d8cac62?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1679897499180-7fc188662cf9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1732036730633-3bb97dadac4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTB8fG1hbiUyMCUyMHBvdHJhaXR8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1647643050583-3ab2bf9e3ba3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA0fHxtYW4lMjAlMjBwb3RyYWl0fGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1596710310557-c905d3047cb8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTQ4fHxtYW4lMjAlMjBwb3RyYWl0fGVufDB8fDB8fHww",
      "https://images.pexels.com/photos/19781182/pexels-photo-19781182/free-photo-of-portrait-of-an-african-man-wearing-dungarees.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30378546/pexels-photo-30378546/free-photo-of-green-electric-guitar-hanging-on-a-wall.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30389456/pexels-photo-30389456/free-photo-of-cozy-ginger-cat-sitting-by-sunlit-window.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/7171858/pexels-photo-7171858.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/1591382/pexels-photo-1591382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30720848/pexels-photo-30720848/free-photo-of-stylish-man-tossing-playing-cards-in-studio.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/30706176/pexels-photo-30706176/free-photo-of-dramatic-male-portrait-with-smoke-and-light.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/30714005/pexels-photo-30714005/free-photo-of-young-man-with-dramatic-shadow-outdoors.jpeg?auto=compress&cs=tinysrgb&w=600",

      "https://images.pexels.com/photos/30720844/pexels-photo-30720844/free-photo-of-stylish-african-american-in-vibrant-orange-fashion.jpeg?auto=compress&cs=tinysrgb&w=600",

      'https://images.pexels.com/photos/30698113/pexels-photo-30698113/free-photo-of-fashionable-young-man-posing-on-yellow-background.jpeg?auto=compress&cs=tinysrgb&w=600',
      "https://images.pexels.com/photos/5427360/pexels-photo-5427360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30695061/pexels-photo-30695061/free-photo-of-romantic-night-portrait-with-a-rose-in-mexico-city.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/30694882/pexels-photo-30694882/free-photo-of-elderly-man-in-green-sweater-standing-by-ladder.jpeg?auto=compress&cs=tinysrgb&w=600",

    ],
    female: [
      "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30745516/pexels-photo-30745516/free-photo-of-portrait-of-woman-in-soft-lighting-indoors.jpeg?auto=compress&cs=tinysrgb&w=600",


      "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/3808041/pexels-photo-3808041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30644453/pexels-photo-30644453/free-photo-of-young-woman-posing-in-sunlit-field-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30632766/pexels-photo-30632766/free-photo-of-black-and-white-portrait-of-a-young-woman.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30618599/pexels-photo-30618599/free-photo-of-woman-with-tattoo-standing-against-beige-wall.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/2787341/pexels-photo-2787341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30546313/pexels-photo-30546313/free-photo-of-elegant-woman-in-ao-dai-with-umbrella-at-japanese-bridge.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30607031/pexels-photo-30607031/free-photo-of-woman-in-green-ao-dai-at-historic-fortress.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30572883/pexels-photo-30572883/free-photo-of-tranquil-portrait-by-a-lake-in-ankara.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30531850/pexels-photo-30531850/free-photo-of-woman-in-traditional-dress-holding-flowers.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30644194/pexels-photo-30644194/free-photo-of-woman-in-front-of-iconic-hagia-sophia-in-istanbul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/14356738/pexels-photo-14356738.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/17593640/pexels-photo-17593640/free-photo-of-soup-with-egg.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/30555720/pexels-photo-30555720/free-photo-of-dramatic-portrait-of-woman-in-red-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/27305813/pexels-photo-27305813/free-photo-of-a-woman-taking-a-photo-with-her-camera.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://www.pexels.com/photo/relaxed-woman-lying-on-white-bed-indoors-30561139/",
      "https://images.pexels.com/photos/30356749/pexels-photo-30356749/free-photo-of-woman-in-hat-gazing-at-seaside-horizon.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30254788/pexels-photo-30254788/free-photo-of-cozy-autumn-dalgona-coffee-and-open-book-scene.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30385813/pexels-photo-30385813/free-photo-of-elegant-woman-in-black-dress-in-moroccan-interior.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30492157/pexels-photo-30492157/free-photo-of-cozy-reading-moment-with-coffee-and-books.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30189620/pexels-photo-30189620/free-photo-of-white-and-gray-cat-on-tree-in-sunlight.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30537429/pexels-photo-30537429/free-photo-of-thoughtful-young-woman-in-orchard-during-fall.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30454607/pexels-photo-30454607/free-photo-of-floral-beauty-portrait-with-vibrant-blooms.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30461878/pexels-photo-30461878/free-photo-of-elegant-afro-inspired-portrait-with-vintage-fashion.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/7327767/pexels-photo-7327767.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30338194/pexels-photo-30338194/free-photo-of-elegant-black-and-white-fashion-portrait.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30309982/pexels-photo-30309982/free-photo-of-woman-holding-camera-at-sunset-beach.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/16486458/pexels-photo-16486458/free-photo-of-woman-wearing-earmuffs-on-winter-day.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30441185/pexels-photo-30441185/free-photo-of-traditional-chinese-attire-with-scarlet-umbrella-in-jakarta.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30253418/pexels-photo-30253418/free-photo-of-elegant-woman-in-flowing-dress-in-forest-setting.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1506089676908-3592f7389d4d?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1",
      "https://images.unsplash.com/photo-1603771550805-abcf98e420e7?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1594270410221-e6a33cbc6fb9?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1484608856193-968d2be4080e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGdpcmwlMjBwb3RyYWl0fGVufDB8fDB8fHww",
      "https://plus.unsplash.com/premium_photo-1668896122554-2a4456667f65?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGdpcmwlMjBwb3RyYWl0fGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1619024329452-45342ede6e58?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fGdpcmwlMjBwb3RyYWl0fGVufDB8fDB8fHww",
      "https://images.pexels.com/photos/30148955/pexels-photo-30148955/free-photo-of-thoughtful-woman-posing-by-window-outdoors.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30401556/pexels-photo-30401556/free-photo-of-pensive-woman-in-black-blazer-by-waterfront.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30697255/pexels-photo-30697255/free-photo-of-stylish-woman-in-pink-cowgirl-outfit-with-flowers.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30441417/pexels-photo-30441417/free-photo-of-elegant-woman-with-orange-umbrella-by-cherry-blossom-tree.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30594080/pexels-photo-30594080/free-photo-of-playful-cat-relaxing-on-sunlit-rocks-outdoors.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30349922/pexels-photo-30349922/free-photo-of-woman-in-white-dress-near-cliffside-lighthouse.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/28512335/pexels-photo-28512335/free-photo-of-elegant-coffee-cup-with-eucalyptus-on-red-fabric.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/12150341/pexels-photo-12150341.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/18390118/pexels-photo-18390118/free-photo-of-sitting-woman-against-orange-background.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30652897/pexels-photo-30652897/free-photo-of-woman-holding-yellow-chrysanthemum-in-soft-light.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30635845/pexels-photo-30635845/free-photo-of-elegant-hand-holding-a-single-pink-tulip-flower.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30539631/pexels-photo-30539631/free-photo-of-monochrome-portrait-of-woman-with-camera.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30492154/pexels-photo-30492154/free-photo-of-silhouette-drawing-heart-on-foggy-window.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30389456/pexels-photo-30389456/free-photo-of-cozy-ginger-cat-sitting-by-sunlit-window.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      "https://images.pexels.com/photos/30747230/pexels-photo-30747230/free-photo-of-elegant-portrait-of-a-thoughtful-woman.jpeg?auto=compress&cs=tinysrgb&w=600",



    ]
  };

  const getRandomPhoto = function (gender) {
    // console.log(Math.floor(Math.random() * PHOTOS[gender].length))
    return PHOTOS[gender][Math.floor(Math.random() * PHOTOS[gender].length)];
  };
  function generateUsername() {
    return faker.internet.username();
  }

  function generateInterests() {
    return faker.helpers.arrayElements(INTERESTS, { min: 5, max: 10 });
  }

  function getRandomCity() {
    return faker.helpers.objectKey(CITIES);
  }



  // Neo4j connection
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
  );
  const session = driver.session();

  try {
    // Clear existing database
    console.log("Clearing existing database...");
    await session.run("MATCH (n) DETACH DELETE n");

    // Generate and insert users
    console.log(`Generating ${TOTAL_USERS} users...`);
    for (let i = 0; i < TOTAL_USERS; i++) {
      const gender = faker.helpers.arrayElement(["male", "female"]);
      const cityName = getRandomCity();
      const coords = CITIES[cityName];
      const profilePic = getRandomPhoto(gender);
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();

      const user = {
        username: generateUsername(),
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: await argon2.hash(
          faker.internet.password({ length: 20, memorable: true })
        ),
        first_name: firstName,
        last_name: lastName,
        age: faker.number.int({ min: 18, max: 20 }),
        gender: gender,
        city: cityName,
        country: "Morocco",
        biography: faker.lorem.paragraph(5),
        x: faker.number.float({
          min: coords.x - 0.005,
          max: coords.x + 0.005,
          precision: 0.00001
        }),
        y: faker.number.float({
          min: coords.y - 0.005,
          max: coords.y + 0.005,
          precision: 0.00001
        }),
        profile_picture: profilePic,
        pics: Array(5).fill(profilePic),
        setup_done: true,
        verified: true,
        is_logged: false,
        fame_rating: faker.number.int({ min: 0, max: 800 }),
        lastSeen: Date.now()
      };

      // Create user node
      await session.run(
        `
        CREATE (u:User {
          username: $username,
          email: $email,
          password: $password,
          first_name: $first_name,
          last_name: $last_name,
          age: toFloat($age),
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
          fame_rating: toInteger($fame_rating),
          lastSeen :$lastSeen,
          notifications: []
        })
      `,
        user
      );

      // Create interests relationships
      const interests = generateInterests();
      for (const interest of interests) {
        await session.run(
          `
          MATCH (u:User {username: $username})
          MERGE (t:Tags {interests: $interest})
          MERGE (u)-[:has_this_interest]->(t)
        `,
          { username: user.username, interest }
        );
      }

      if ((i + 1) % 10 === 0) {
        console.log(`Progress: ${i + 1}/${TOTAL_USERS} users created`);
      }
    }

    // Print statistics
    const userCount = await session.run(
      "MATCH (u:User) RETURN count(u) as count"
    );
    const tagCount = await session.run(
      "MATCH (t:Tags) RETURN count(t) as count"
    );
    const relCount = await session.run(
      "MATCH ()-[r:has_this_interest]->() RETURN count(r) as count"
    );
    const genderStats = await session.run(
      "MATCH (u:User) RETURN u.gender as gender, count(*) as count"
    );
    const cityStats = await session.run(
      "MATCH (u:User) RETURN u.city as city, count(*) as count ORDER BY count DESC"
    );

    console.log("\nDatabase Statistics:");
    console.log(`Total Users: ${userCount.records[0].get("count")}`);
    console.log(`Total Unique Interests: ${tagCount.records[0].get("count")}`);
    console.log(
      `Total Interest Relationships: ${relCount.records[0].get("count")}`
    );

    console.log("\nGender Distribution:");
    genderStats.records.forEach((record) => {
      console.log(`${record.get("gender")}: ${record.get("count")}`);
    });

    console.log("\nCity Distribution:");
    cityStats.records.forEach((record) => {
      console.log(`${record.get("city")}: ${record.get("count")}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

// Run the function
populateNeo4jDatabase().catch(console.error);
