# Manage office / Server side

The system allowing users to create and manage office space. A server side project built with Cloud Functions Firebase and Express.

## Getting Started

Follow the instructions below to get started and get a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
What things you need to install after cloning the repository into your machine

```
npm install -g firebase-tools
```

### Installing

A step by step series of examples that tell you how to get a development env running

After successfully cloning the repo, cd into it and then run one of the following command 
You might want to cd into a folder called functions, but you should still be able to deploy anyway

```
firebase deploy
firebase serve
```

And repeat

```
until finished
```
Asuming that you have now firebase serve inside your terminal, find the link like```http://localhost:5000/manageofficeproj-23044/us-central1/api``` At this point you will need Postman or Insomnia a software development tool that will enables to test, calls these APIs.
All path arguments can be found inside index.js, see the index.js file 
Remember the config(firebaseConfig) file is pointing to my db, so when you successfully do a post request, your information will be available in my db.
I will later change to RULES in my db so that only registered users has access to create such.

## Author

* **Christian  Ngubana** 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



