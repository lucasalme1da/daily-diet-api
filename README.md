This repository contains the Daliy Diet API developed as part of one of the challenges from the Rocketseat Node.js course.

Daily Diet is an app that allows users to monitor the quality of the food they consume, dividing it into two categories: healthy or unhealthy. Users can log the foods they ate and access a summary with data on their consumption and other details.

The API was built using Node.js with fastify and a relational database (agnostic - sqlite for development, postgresql for production).

Tests implemented using vitest.

### Online Demo

The API is will be avaliable soon.

#### Avaliable routes

- POST /users/signup - Create a user only by name and link them via cookies
- POST /users/login - Login and store session using cookies
- GET /foods - List a user's food consumption
- GET /foods/:id - Get details about a food item
- POST /foods - Records a food item consumption
- PUT /foods - Edit a food record
- DELETE /foods - Delete a food item
- GET /foods/summary - Get a summary of consumption

### Running the Project

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

### Challenge Business Rules

- [x] A user can be created
- [x] A user can be identified across requests
- [x] A food can be registered with the following information:
  - Food must be associated with a user
  - Name
  - Description
  - Date and time
  - Whether it is within the diet or not
- [x] A food can be updated, including all of the fields above
- [x] A food can be deleted
- [x] All foods belonging to a user can be listed
- [x] A single food can be retrieved
- [x] User metrics can be retrieved:
  - Total number of foods registered
  - Total number of foods within the diet
  - Total number of foods outside the diet
  - Best streak of foods within the diet
- [x] A user can only view, update, and delete foods that they created
