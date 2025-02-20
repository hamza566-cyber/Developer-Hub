Social Connect App

Social Connect is a mobile application that allows users to connect socially with each other. Users can create accounts, log in, and manage their profiles with ease. The app provides features for posting, following, chatting, and much more to enhance social interactions.

Features

Authentication

Sign Up & Log In: Users can sign up and log in to their accounts.

Form Validation: Form validation is handled using the Yup library to ensure input accuracy.

Navigation

Screen Navigation: The app uses a robust navigation system for seamless movement between screens (profile, settings, dashboard, etc.).

Profile Management

Profile Page: Displays the user's profile picture, followers, following count, and total posts.

Editable Profile: Users can update their profile picture and bio in real-time.

Data Fetching: User details (name, bio, image) are fetched from the users collection, while posts are fetched from the posts collection.

Real-Time Updates: Asynchronous functions and Firestore's onSnapshot ensure real-time profile updates.

Dashboard

Post Creation: A post modal is used to allow users to create and publish posts.

Post Details: Posts display the username, post date, and user profile.

Interactions: Users can like posts, comment on them, and follow/unfollow other users.

Profile Navigation: Clicking on a post's username navigates to that user's profile.

Data Fetching: The dashboard fetches post data from Firestore and displays it in real-time using a flag list.

Settings

Logout: Users can log out from their accounts.

About Us: A dedicated page providing information about the app and team.

Screen Navigation: Smooth transitions between settings and other app sections.

Chat

Chat List: Displays user chats with a search option to find other users.

Chat Rooms: Separate chat rooms are created for each conversation between two users.

Real-Time Messaging: Instant messaging is enabled using Firestore. Messages are fetched and displayed in real-time.

Chat Storage: Chats are stored in Firestore under the chats collection.

Technology Stack

React Native for building the mobile app.

Firebase Firestore for storing user data, posts, and chats.

Yup for form validation.

Firestore onSnapshot for real-time data updates.

Installation and Setup

Clone the repository:

git clone <https://github.com/hamza566-cyber/Developer-Hub>

Navigate to the project directory:

cd social-connect

Install dependencies:

npm install

Start the development server:

npm start

Run the app on an emulator or a physical device.

Contact

For any questions or issues, please contact 