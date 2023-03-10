const express = require ('express')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const knex = require('knex')

const postgres = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'shawon.sheikh',
        password: '',
        database: 'smart-brain'
    }
})

postgres.select('*').from('users').then(data => {
    console.log(data)
})



const app = express()



app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('success')
})

app.post('/signin', (req, res) => {
    postgres.select('email', 'hash').from('login')
    .where('email' , '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
        if (isValid) {
            return postgres.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
            
        } else{
            res.status(400).json('wrong credentials')
        }
        
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password} = req.body
    const hash = bcrypt.hashSync(password)
    postgres.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email

        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
                }).then(user => {
                    res.json(user[0])
                })
                        })
                        .then(trx.commit)
                        .catch(trx.rollback)
                    })
   
   .catch(err => res.status(400).json('unable to register'))
    
})

app.get('/profile/:id', (req, res)=> {
    const { id} = req.params
   postgres.select('*').from('users').where({
    id: id
   })
   .then(user => {
    if (user.length){
        res.json(user[0])
    }
    else{
        res.status(400).json('Not found')
    }
   
   })
   .catch(err => {res.status(400).json('error getting user')})
})

app.put('/image', (req, res) => {
    const { id} = req.body
    postgres('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries)
    })
    .catch(err => res.status(400).json('unable to get count'))
})

app.listen(3000, ()=> {
    console.log('app is running on port 3000')
})
