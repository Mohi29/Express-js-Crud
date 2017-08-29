import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
const app = express();

//setup body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// create a write stream (in append mode) 
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
 
// setup the logger 
app.use(logger('combined', {stream: accessLogStream}))

/* mongoose db connection */
const db = 'mongodb://localhost/mydb1';
mongoose.connect(db,{useMongoClient: true});

/* book Schema as a collection */
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
let bookSchema = new Schema({
	Title : {type:'String',require:true},
	Price : 'Number',
	Author : 'String',
	Category : 'String'
},{versionKey:false})
let myBook = mongoose.model('Book',bookSchema);

/* handling the default request */
app.get('/',(req,res)=> {
	res.send("Welcome to book system");
})

/* show all books present in db */
app.get('/books',(req,res)=> {
	console.log("getting all books");
	myBook.find({},(err,docs)=>{
		if(err){
			console.log(err);
			res.send(err);
		} else {
			console.log(docs);
			res.json(docs);
		}
	})
})

/* show one book after matching id */
app.get('/books/:id',(req,res)=> {
	console.log("getting one book");
	myBook.findOne({_id : req.param.id},(err,docs)=>{
		if(err){
			console.log(err);
			res.send(err);
		} else {
			console.log(docs);
			res.json(docs);
		}
	})
})

/* insert book data */
app.post('/books/insert',(req,res)=> {
	myBook.create(req.body,(err,Book)=> {
		if(err){
			console.log("error while saving book");
			res.send("error while saving book");
		} else {
			console.log(Book);
			res.send(Book);
		}
	})
})

/* update book data */
app.put('/books/update/:id',(req,res)=> {
	myBook.findOneAndUpdate({
		_id:req.params.id
		},{$set:
			{Title:req.body.Title,
			Author:req.body.Author,
			Price:req.body.Price,
			Category:req.body.Category}},
			{upsert:'true'},(err,newBook)=> {
				if(err){
				console.log("error while updating book");
				res.send("error while updating book");
				} else {
				console.log(newBook);
				res.send(newBook);
			}
		})
})

/* delete book data */
app.delete('/books/delete/:id',(req,res)=> {
	myBook.findOneAndRemove({_id:req.params.id},(err,Book)=> {
		if(err){
		console.log("error while deleting book");
		res.send("error while deleting book");
		} else {
		console.log(Book);
		res.send(Book);
		}
	})
})

/* port listen and host creation */
http.createServer(app).listen(8001, '127.0.0.1');
console.log('Server running at http://127.0.0.1:8001/');
