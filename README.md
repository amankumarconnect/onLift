# onLift - Interactive Elevator Simulation

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![EJS](https://img.shields.io/badge/EJS-A91E50?style=for-the-badge&logo=javascript&logoColor=white)](https://ejs.co/) [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/)

## Overview

onLift is a web application built as a learning exercise to simulate the operation of an elevator system, inspired by observations of a hostel lift. It goes beyond a simple visual representation, incorporating distinct user roles (Admin and User), complex state management, and manual operational logic. The project served as a deep dive into backend development concepts, full-stack integration, and simulating real-world, state-dependent interactions.

The application is built using the MEEN stack (MongoDB, Express.js, EJS, Node.js), with initial UI concepts designed in Figma.

## Features

### Admin Role (`admin` user - configurable):

*   **Manual Lift Operation:**
    *   `GO`: Manually dispatches the lift to the next floor in the user request queue.
*   **Monitoring & Control:**
    *   `CAMERA`: Allows the admin to view the profile pictures of users currently *inside* the elevator cabin.
    *   `ORDER`: Toggles the lift's operational status between "In Service" (Green Light) and "Out of Order" (Red Light).
*   **Emergency Protocol:**
    *   `RESCUE`: This button *only* appears if the lift is marked "Out of Order" while users are still inside. Clicking it simulates an emergency evacuation, clearing the lift occupants.

### User Role:

*   **Authentication:**
    *   `Signup`: Users can register with a Username, Weight (in KGs), Password, and upload a Profile Picture.
    *   `Login`: Secure login for registered users.
    *   Personalized welcome message and profile picture display upon login.
*   **Elevator Interaction:**
    *   `ENTER`: Button appears when the lift is not on the user's current floor. Clicking it adds the user to the destination queue.
    *   `WAITING`: Status indication after clicking `ENTER` while the lift is en route.
    *   `ENTER NOW`: Button appears *only* when the lift arrives at the user's floor, is operational (Green Light), *and* has sufficient weight capacity remaining.
    *   **Weight Limit:** The system prevents users from entering if their weight exceeds the lift's remaining capacity (based on signup data and current occupants).
    *   **Floor Selection:** Once inside the lift (after clicking `ENTER NOW`), users are presented with floor buttons to choose their destination.

### System Features:

*   **State Management:** Tracks lift's current floor, direction, operational status, user queue, current occupants (and their total weight).
*   **Dynamic UI:** Interface elements (buttons, status lights, occupant view) change based on the lift's state and the user's role/location.
*   **Alerts:** Uses browser alerts for system messages (e.g., "Lift out of order", "No users inside", potentially "Lift is full").
*   **Data Persistence:** User credentials, profile pictures, and potentially lift state are stored in MongoDB.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Frontend Templating:** EJS (Embedded JavaScript templates)
*   **Database:** MongoDB (potentially with Mongoose ODM)
*   **Design:** Figma (for initial UI/UX concepts)
*   **Environment Variables:** dotenv

## Screenshots

![Alt text](images/Screenshot%202025-04-30%20121832.png)

![Alt text](images/Screenshot%202025-04-30%20121946.png)

![Alt text](images/Screenshot%202025-04-30%20122927.png)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/onlift.git
    cd onlift
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create Environment Variables:**
    Create a `.env` file in the root directory and add the following variables. Replace the placeholder values with your actual configuration.
    ```dotenv
    # .env file
    MONGODB_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/onlift or MongoDB Atlas URI
    ```
    *Note: Ensure you have a running MongoDB instance accessible via the `MONGODB_URI`.*

4.  **Run the application:**
    *   For development (if you have `nodemon`):
        ```bash
        npm run dev
        ```
    Or directly using node:
    ```bash
    node app.js # Or your main server file name
    ```

5.  **Access the application:**
    Open your web browser and navigate to `http://localhost:PORT` (e.g., `http://localhost:3000`).

## Usage

1.  Navigate to the application URL.
2.  **Signup:** Create a new user account, providing username, weight, password, and optionally a profile picture.
3.  **Login:** Log in using your credentials.
    *   If you log in with the username defined as `ADMIN_USERNAME` in your `.env` file, you will access the Admin dashboard.
    *   Otherwise, you will access the standard User dashboard.
4.  **User Flow:**
    *   See the lift status and your current floor.
    *   Click `ENTER` to request the lift to your floor. Wait for it to arrive (`WAITING` state).
    *   If conditions are met (lift arrives, operational, capacity available), click `ENTER NOW`.
    *   Once inside, select your destination floor.
5.  **Admin Flow:**
    *   View the overall lift status, current floor, and direction.
    *   Use `GO` to move the lift to the next requested floor.
    *   Use `CAMERA` to see who is inside.
    *   Use `ORDER` to toggle the lift's operational status.
    *   Use `RESCUE` if the lift is Out of Order with users inside.

## Project Status

This project is primarily a **learning exercise** and a functional prototype demonstrating complex backend logic and state management. It was completed to practice and solidify full-stack development skills.

## Future Ideas

*   Implement real-time updates using WebSockets (e.g., Socket.IO) for smoother UI updates.
*   Add support for multiple elevators.
*   Develop a more sophisticated lift scheduling algorithm instead of a simple queue.
*   Implement actual image storage/retrieval (e.g., Cloudinary, S3) instead of just storing paths/placeholders.
*   Add more detailed error handling and user feedback.
*   Unit and integration tests.
