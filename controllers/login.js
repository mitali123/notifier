const models = require('../models');
/*for password encryption */
const bcrypt = require("bcryptjs");
const saltRounds = 10;

/* add new user to db */
var createUser = function(req, res, next) {
	/* validate password strength */
	//api timer start
	var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
 	var password = req.body.password;
	var nameRegex = /^[A-Za-z]+$/;
	var emailRegex = /\S+@\S+\.\S+/;
	 //check fname and lname should be letters only
	 	//search db to find any user with same email
		let user_name = req.body.username;
		
		models.User.findOne({ where: { username: user_name } })
		.then(user => { 
			if(user!=null)
			{
				//user exist in db
				console.info('400: Bad Request - user exists');
				res.status(400).json({ error: 'user already exists' });
			}
			else
			{
				//user with same email doesnt exist
				//check for strong password
				if(passwordRegex.test(password))
				{
					 /*strong password*/
					 //check username is email
					 if(req.body.username.match(emailRegex))
					 {
						 //valid username
						 //check fname and lname
						if(req.body.first_name.match(nameRegex) && req.body.last_name.match(nameRegex))
						{
							/*encrypt password using bcrypt*/
	 						bcrypt.genSalt(saltRounds)
	 						.then(salt => {
    							console.log(`Salt: ${salt}`);
    							return bcrypt.hash(password, salt);
  							})
  							.then(hash => {
    							console.log(`Hash: ${hash}`);
    							// Store hash in your password DB.

    							return models.User.create({
									username: req.body.username,
									password: hash,
									first_name: req.body.first_name,
									last_name: req.body.last_name
								})
								.then( u => {
									console.log('user created');
									res.status(200).json({ id : u.user_id, first_name: u.first_name, last_name: u.last_name, username: u.username, account_created: u.account_created, account_updated: u.account_updated });
								})
								.catch(err => console.error(err.message));
  							})
  							.catch(err => console.error(err.message));
						}
						else
						{
							console.log('required firstname and lastname');
							res.status(400).json({ error: 'required firstname and lastname' });
						} 
					 }
					 else
					 {
						 //invalid username
						 console.log('invalid username -- should be email');
						 res.status(400).json({ error: 'invalid username -- should be email' });
					 }
					
				}
				else
				{
					/*create new password -- Not strong password*/
			   		console.log('Not a strong password');
			   		res.status(400).json({ error: 'Password not strong enough - Password must contain at least 8 characters,at least 1 number,at least 1 upper case letter, at least 1 lower case letter, at least 1 special character,it must not contain any spaces' });
				}
			}
		})
  		.catch(err => console.error(err.message));	 	
	 	
};

var get_user_info = function(req, res, next) {
	//search db to find any user with same email
	console.log('id:'+req.body.id);
		 models.User.findOne({ where: { user_id: req.body.id } })
		 .then(u => { 
			console.log('user found');
			res.status(200).json({ id : u.user_id, first_name: u.first_name, last_name: u.last_name, username: u.username, account_created: u.account_created, account_updated: u.account_updated });
		 })
		 .catch(err => {
			console.error(err.message)
			res.status(404).json({ error: 'User not found' });
		 });
}

var get_auth_user_info = function(req, res, next) {
	const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	const [username, password] = credentials.split(':');
 	console.log('in auth func');
		 models.User.findOne({ where: { username: username } })
		 .then(u => { 
			console.log('user found');
			res.status(200).json({ id : u.user_id, first_name: u.first_name, last_name: u.last_name, username: u.username, account_created: u.account_created, account_updated: u.account_updated });
		 })
		 .catch(err => {
			console.error(err.message)
			res.status(404).json({ error: 'User not found' });
		 });
}

var authenticate_user = function(req, res, next) {
	if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ error: 'Missing Authorization Header' });
	}

	// verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	const [user_name, password] = credentials.split(':');
	console.log("username:"+user_name+"password:"+password);

	models.User.findOne({ where: { username: user_name } })
		 .then(u => { 
			let valid_password_hash = u.password;
			bcrypt.compare(password, valid_password_hash)
  			.then(result => {
    			//applog.info(result);
    			if(result == true)
    			{
    				/*password correct*/
					console.log("user authorized");
					return next();
    			}
    			else
    			{
					/*password incorrect */
					console.log("user unauthorized");
					res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  					res.status(401).json({ error: 'User Unauthorized -- Authentication required.'}); // custom messa

    			}
  			})
  			.catch(err => console.error(err.message));
		})
		 .catch(err => {
			console.error(err.message)
			res.status(404).json({ error: 'User not found' });
		 });

}

//update user account details
var update_auth_user_info = function(req, res, next) {
	// const base64Credentials =  req.headers.authorization.split(' ')[1];
    // const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	// const [username, password] = credentials.split(':');
	let req_first_name = req.body.first_name;
	let req_last_name = req.body.last_name;
	let req_password = req.body.password;
	let req_username = req.body.username;
	console.log("fname:"+req_first_name+"uname:"+req_username);
	//update only if same user
	const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	const [username, password] = credentials.split(':');
	if(req_username == username)
	{
		var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
		if(passwordRegex.test(req_password))
		{
			//strong password
			console.log("password strong");
			/*encrypt password using bcrypt*/
			bcrypt.genSalt(saltRounds)
			.then(salt => {
			console.log(`Salt: ${salt}`);
			return bcrypt.hash(req_password, salt);
			})
			.then(hash => {
				console.log(`Hash: ${hash}`);
				// Store hash in your password DB
				models.User.update({ first_name: req_first_name , last_name: req_last_name, password: hash },{ 
				where: {
						username : req_username
					}
				})
				.then(result => {
						console.log("user details updated");
						res.status(204).json({ message: "User Details updated" });

				})
				.catch(err => {
					res.status(400).json({ error: 'Cannot be updated'});
				});
			})
		}
		else
		{

			/*create new password -- Not strong password*/
						console.log('Not a strong password');
						res.status(400).json({ error: 'Password not strong enough - Password must contain at least 8 characters,at least 1 number,at least 1 upper case letter, at least 1 lower case letter, at least 1 special character,it must not contain any spaces' });
				
		}
	}
	else
	{
		console.log("user not authorized");
		res.status(400).json({error: 'Not authorized -- You can only change your details'});
	}
	
}
exports.createUser = createUser;
exports.get_user_info = get_user_info;
exports.get_auth_user_info = get_auth_user_info;
exports.authenticate_user = authenticate_user;
exports.update_auth_user_info = update_auth_user_info;

