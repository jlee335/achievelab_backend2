const F = require("./functions");

F.signUp("daegartwo@gmail.com", "passwordpass2#", "John Doe")
    .then(()=>console.log("user signed up successfully"))
    .catch((error)=>console.error("Error Signing up: ", error));
