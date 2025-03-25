# `</blog>` - Blogging CMS

## Introduction
</blog> is a modern Blogging CMS built with Symfony 7, React.js 18, TypeScript, and Tailwind CSS, designed to provide a seamless content management experience. It features:
- **ShadCN/UI** for a polished UI component system
- **TinyMCE** editor for rich text editing
- **Dockerized deployment** with Nginx for reliability
- **MySQL on AWS** for scalability and performance

This CMS is built for flexibility, efficiency, and performance, making it an ideal solution for content creators and developers alike.

## Deployment
</blog> is designed for smooth, scalable, and efficient deployment using **Amazon ECS (Elastic Container Service) on EC2**. The deployment process is fully automated with **GitHub Actions** and **AWS CodeBuild**, ensuring a robust CI/CD pipeline.

## Local Development
### Requirements
Ensure you have the following dependencies installed:

- **WSL 2** / Ubuntu 22
- **Node.js** 22.3.0
- **Yarn** 4.6.0
- **Docker** 27.3.1
- **Composer** 2.7.7
- **PHP** 8.3.11

With these tools in place, you can easily set up, develop, and test the CMS locally before deploying it to production.

## Todo(s):
- **Dashboard Analytics** for blog pages
- **Custom Events** for blog page interactions (views, likes, dislikes, read time)
- **Upgrade Rich Text Editor** from TinyMCE to Monaco Editor
  - Drag & Drop components
- **Account Management**
  - Role-based blog posting
- **User Features**
  - Account profile page
    - account profile analytics
    - temporary profile avatar
    - AccountType constrain
    - OTP email/phone verification
    - password validation with special characters
  - Customizable About Page using TinyMCE
  - Contact Us page & inbox
- **Account Registration**
  - UX/UI password validation