# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (a la bit.ly).

## Final Product

# URL feature

TinyApp allow the user to register an account and keep track of the the user's own shorten URL. Please see below login Page. Links for the register page and login page are accessible on the top right corner

!["Screenshot of login page"](https://github.com/williamwyj/tinyapp/blob/d3b57f7b9aefe013ce62631d701662b2e922052e/docs/login%20page.png)

Once logged in, the home page lists the user's shortened URL, the corresponding long URL, a button for delete and a link to edit the URL. Please see below screen shot of the home page.

!["Screenshot of the url page"](https://github.com/williamwyj/tinyapp/blob/1c52547a7e8f6e5d824fe55bcbb9506fc24f7dfc/docs/urls%20page.png)

Thru the Edit link, the user can access information and editing options for each individual URL. The user can change the long URL the shortened URL is associated with and see statics on the shortened URL, including number of total visits, number of unique visits, and a table of past visits, the visitor and visit time. Please see below for this page.

!["Screenshot of the url:shortenURL page"](https://github.com/williamwyj/tinyapp/blob/1c52547a7e8f6e5d824fe55bcbb9506fc24f7dfc/docs/url.shortURL%20page.png)

On the top bar, Create New URL link will direct the user to the page for creating new shorten URL. Please see below for this page.

!["Screenshot of the url.new page"](https://github.com/williamwyj/tinyapp/blob/1c52547a7e8f6e5d824fe55bcbb9506fc24f7dfc/docs/url.new%20page.png)

# Security

TinyApp protects its users by hashing user passwords and encrypting cookies. Passwords stored in the server are all hashed. Cookies are encypted to secure every user's information.

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the 'npm install' command).
- Run the developement web server using the 'node express_server.js' command.