import { Request, Response, NextFunction, RequestHandler } from "express";

export function validatePassword(req: Request, res: Response, next: NextFunction) {
  const password = req.body.password;

  if (!password) {
    res.status(400).json("Password is required");
    return;
  }

  // Check length
  if (password.length < 8 || password.length > 50) {
    res.status(400).json("Password must be between 8 and 50 characters");
    return;
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    res.status(400).json("Password must contain at least one uppercase letter");
    return;
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    res.status(400).json("Password must contain at least one lowercase letter");
    return;
  }

  // Check for at least 2 digits
  if ((password.match(/\d/g) || []).length < 2) {
    res.status(400).json("Password must contain at least two digits");
    return;
  }

  // Check for no spaces
  if (/\s/.test(password)) {
    res.status(400).json("Password cannot contain spaces");
    return;
  }

  // Check for at least 1 symbol
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
    res.status(400).json("Password must contain at least one special character");
    return;
  }

  next();
}

export function validateEmail(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email || req.body.newEmail;

  // console.log(email , " email")
  // console.log(req.body , " body")

  if (!email) {
    res.status(400).json("Email is required");
    return;
  }

  // Split email into parts: local@domain.tld
  const parts = email.split("@");

  // Check if we have exactly one @ symbol
  if (parts.length !== 2) {
    res.status(400).json("Email must contain exactly one @ symbol");
    return;
  }

  const [localPart, domain] = parts;

  // Check local part (before @)
  if (localPart.length === 0) {
    res.status(400).json("Email must have characters before @");
    return;
  }

  // Check if local part has spaces
  if (localPart.includes(" ")) {
    res.status(400).json("Email cannot contain spaces before @");
    return;
  }

  // Check domain part (after @)
  if (!domain.includes(".")) {
    res.status(400).json("Email domain must contain a dot");
    return;
  }

  // Check if domain has spaces
  if (domain.includes(" ")) {
    res.status(400).json("Email cannot contain spaces after @");
    return;
  }

  // Check the parts after the last dot
  const domainParts = domain.split(".");
  // console.log(domainParts, " domain part -----------")
  const topLevelDomain = domainParts[domainParts.length - 1];
  // console.log(topLevelDomain, " topLevelDomain  -----------")

  //   [ 'gmail', 'com' ]  domain part -----------
  // com  topLevelDomain  -
  if (topLevelDomain.length === 0) {
    res.status(400).json("Email must have characters after the dot");
    return;
  }

  // Check total length
  if (email.length < 7 || email.length > 30) {
    res.status(400).json("Email must be between 7 and 30 characters long");
    return;
  }

  next();
}

export function validateUsername(req: Request, res: Response, next: NextFunction): void {
  const username = req.body.username;

  if (!username) {
    res.status(400).json("Username is required");
    return;
  }

  if (username.length < 6 || username.length > 40) {
    res.status(400).json("Username must be between 6 and 40 characters");
    return;
  }
  //The test() method is a RegExp expression method.
  //It searches a string for a pattern, and returns true or false, depending on the result.
  //Without the +, it would only match a single character

  // if (!/^[a-zA-Z0-9]+$/.test(username)) {
  //   res.status(400).json("Username must contain only alphanumeric characters");
  //   return;
  // }

  if (username.includes(" ") || username.includes("\t")) {
    res.status(400).json("Username cannot contain spaces or tabs");
    return;
  }

  next();
}

export function validateName(req: Request, res: Response, next: NextFunction): void {
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const nameRegex = /^[A-Za-z]+$/;

  if (!first_name) {
    res.status(400).json(`fist name is required`);
    return;
  }
  if (!nameRegex.test(first_name)) {
    res.status(400).json(`First name must contain only alphabetical characters without spaces`);
    return;
  }

  if (first_name.length < 3 || first_name.length > 30) {
    res.status(400).json(`fist name must be between 3 and 30 characters`);
    return;
  }
  if (!last_name) {
    res.status(400).json(`last name is required`);
    return;
  }
  if (!nameRegex.test(last_name)) {
    res.status(400).json(`Last name must contain only alphabetical characters`);
    return;
  }

  if (last_name.length < 3 || last_name.length > 30) {
    res.status(400).json(`last name must be between 3 and 30 characters without spaces`);
    return;
  }
  //next() is a function that tells Express.js to move on to the next middleware or route handler in the chain
  next();
}

export function validateAge(req: Request, res: Response, next: NextFunction): void {
  const age = req.body.age;

  if (!age) {
    res.status(400).json("Age is required");
    return;
  }

  const numAge = Number(age);
  if (!Number.isInteger(numAge) || numAge < 18 || numAge > 100) {
    res.status(400).json("Age must be between 18 and 100");
    return;
  }

  next();
}

export function validateGender(req: Request, res: Response, next: NextFunction): void {
  try {
    const gender = req.body.gender;

    if (!gender) {
      res.status(400).json("Gender is required");
      return;
    }

    if (gender !== "male" && gender !== "female") {
      res.status(400).json("Gender must be 'male' or 'female'");
      return;
    }

    next();
  } catch {
    res.status(400).json("invalid Gender");
    return;
  }
}

export function validateBiography(req: Request, res: Response, next: NextFunction): void {
  try {
    const biography = req.body.biography;

    if (!biography) {
      res.status(400).json("Biography is required");
      return;
    }

    if (biography.length < 20 || biography.length > 200) {
      res.status(400).json("Biography must be between 20 and 200 characters");
      return;
    }

    next();
  } catch {
    res.status(400).json("Invalid biography");
    return;
  }
}

export function validateInterests(req: Request, res: Response, next: NextFunction): void {
  try {
    const interests = req.body.interests;

    if (!interests) {
      res.status(400).json("Interests are required");
      return;
    }
    if (!Array.isArray(interests)) {
      res.status(400).json("Interests must be an array");
      return;
    }
    if (interests.length > 20 || interests.length < 1) {
      res.status(400).json("User can have only from 1 to 20 Interests");
      return;
    }

    for (const element of interests) {
      if (element.length > 20 || element.length < 3) {
        res.status(400).json("Interest length must be between 2 and 20");
        return;
      }
    }

    next();
  } catch {
    res.status(400).json("Invalid Interests");
    return;
  }
}
