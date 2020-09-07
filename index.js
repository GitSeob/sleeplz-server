const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const bodyParser = require('body-parser')
const mysql = require('mysql')


const db = mysql.createConnection({
	host: 'localhost',
	user: 'capstone',
	password: '12!@qwQW',
	database: 'cap_server'
})

db.connect()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/users', function(req, res){
	console.log('hello')
	db.query('SELECT * FROM user ', function (error, results, fields){
		if(error) throw error
		res.json(results)
	})
})

app.get('/user/:userid', function(req, res){
	let userid = req.params.userid
	res.get('hi')

	if(!userid){
		return res.status(400),send({ error: true, message: '유저 정보가 존재하지 않습니다.'})
	}

	db.query('SELECT * FROM user WHERE userid = ?', userid, function(error, results, fields){
		if(error) throw error

		res.send('correct user information')
	})
})

app.post('/user', function(req, res){
	console.log(req.body)
	
	let userid = req.body.username
	let userpw = req.body.password

	db.query("SELECT * FROM user WHERE userid=? AND userpw=?",
	 [userid, userpw], function(error, results, fields){
		if(error){
			console.log(error)
			res.send({'success': false, 'message': 'could not connect do db'})
		}
		if(results.length > 0){
			res.send({'success': true, 'user': results[0].userid})
		} else {
			res.send({'success': false, 'message': 'user not found'})
		}
	})

})

let pyModule = (filename) => {
	return new Promise(function(resolve, reject){
		var { PythonShell } = require('python-shell')

		var options = {
			mode: 'text',
			pythonPath: 'python3',
			pythonOptions: ['-u'],
			scriptPath: '',
			args: [filename]
		}

		PythonShell.run('./pyModule/test.py', options, function(err, results){
			if(err) {
				// console.log(err)
				reject(err)
			}
			else {
				resolve(results)
			}
		})

		// const pyprog = spawn('python3', ['./pyModule/solModule.py', filename, data])

		// pyprog.stdout.on('data', function(data){
		// 	resolve(data.toString())
		// })
		// console.log("py")
		// resolve()
	})
}

let _writeFile = function(filename, fileData){
	return new Promise(function(resolve, reject){
		var fs = require('fs')

		fs.writeFile(filename, fileData, 'utf8', (error) => {
			if(error) {
				reject(error)
			}
			else{
				// fs.readFile(filename, 'utf8', function readFileCallback(err, data){
				// 	if(err) console.log(err)
				// 	else { 
				// 		resolve(data)					
				// 	}
				// })
				resolve("success")
			}
		
		})
	})
}

let _writeFileBackup = function(filename, fileData){
	return new Promise(function(resolve, reject){
		var fs = require('fs')

		fs.writeFile(filename, fileData, 'utf8', (error) => {
			if(error) {
				reject(error)
			}
			else{
				// fs.readFile(filename, 'utf8', function readFileCallback(err, data){
				// 	if(err) console.log(err)
				// 	else { 
				// 		resolve(data)					
				// 	}
				// })
				resolve("backup success")
			}
		
		})
	})
}

let _readFile = function(filename){
	return new Promise(function(resolve, reject){
		var fs = require('fs')

		fs.readFile(filename, 'utf8', (err, data) => {
			if(err) reject(err)
			else {
				// console.log(data)
				sendData = JSON.parse(data)
				resolve(sendData)
			}
		})
	})
}

app.get('/chart/day/:userid', function(req, res){
	console.log('chart')
	let userid = req.params.userid
	let filename = 'userJson/'+userid+'_day.json'

	_readFile(filename)
	.then(response => {
		// console.log(response)
		res.json(response)
	})
	.catch(err => {
		console.log(err)
		res.send({
			'message': false
		})
	})

})


async function _AsyncFunc(filename, fileData, filename2, fileData2){
	console.log('async')
	try{
		await _writeFile(filename, fileData)
		await _writeFileBackup(filename2, fileData2)
		result = await pyModule(filename)
	}	
	catch(e){
		console.log(e)
	}
	console.log('async done')
	return(result)
}

app.post('/solution/:userid', function(req, res){
	const fs = require('fs')
	let now = new Date()
	update_time = now.toISOString().substring(0,10)
	let userid = req.params.userid
	let filename = 'userJson/'+ userid + '.json'
	let filename2 = 'userJson/backup_'+userid+'.json'

	// let date = req.body.date
	let score = req.body.score
	// let sleepTime = req.body.sleepTime
	// let coffee = req.body.coffee
	// let exerTime = req.body.exerTime
	// let lastEat = req.body.lastEat

	var fileData = JSON.stringify(req.body.solData)
	var fileData2 = JSON.stringify(req.body.backupData)


	console.log(fileData2)
	// _writeFile(filename, fileData)
	// .then(text => {
	// 	console.log(text)
	// }, error => { 
	// 	console.log(error)
	// })

	_AsyncFunc(filename, fileData, filename2, fileData2)
	.then((resData) => {
		console.log(resData)
		res.send({
			"update_date": update_time,
			"score": resData[6],
			"sleepTime": resData[7],
			"coffee": resData[8],
			"exerTime": resData[9],
			"lastEat": resData[10],
		})
	})
	
	// res.send(score)
	// data = req.body
})



http.listen(3030, function(){
	console.log('listening on *:3000')
})
