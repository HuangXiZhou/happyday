#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const axios = require('axios')
const YQL = require('yql')
const inquirer = require('inquirer')
const _ = require('lodash')

const URL_IP = 'http://api.map.baidu.com/location/ip'
const URL_FORECAST = 'http://api.map.baidu.com/telematics/v3/weather'

const KEY = { ak: '8PLvkWpF06CnaSu72BBsmyIHowbf76Lr' }

let getweatherModel = {
	location: '',
	output: 'json',
	ak: KEY.ak,
}

program
	.command('weather')
	.alias('w')
	.description(chalk.green('Get weather forecast ;)'))
	.action(option => {
		axios.get(URL_IP, {
			params: KEY
		})
		.then(res => {
			if(res.status !== 200) {
				console.log(chalk.red('Whoops!!! There is something wrong with your network.'))
			} else {
				if(res.data.status !== 0) {
					console.log(chalk.red('Oye!!! You are not in China.'))
					console.log('')
					console.log('so...')
					let config = _.assign({
							cityName: ''
					}, option)
					let promps = []
					if(config.cityName !== 'string') {
						promps.push({
							type: 'input',
							name: 'cityName',
							message: 'Input your cityname:',
							validate: input => {
								if(!input) {
									return chalk.red('You should input something here...')
								}
								return true
							}
						})
					}
					inquirer.prompt(promps).then(answers => {
						var query = new YQL(`select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${answers.cityName}")`)
						query.exec((err, data) => {
							if(err) {
								console.log(chalk.red('emmmmm... I don\'t know what happened.'))
							} else {
								if(!data.query.count) {
									console.log(chalk.red('Please... Enter the correct city name.'))
								} else {
									let resource = data.query.results.channel.item
									console.log(
										`City: ${chalk.green(answers.cityName)} ❤️\n` +
										`Date: ${chalk.green(resource.condition.date)}\n` +
										`Temp: ${chalk.green(resource.condition.temp)}${chalk.green('F')} | ${chalk.green(resource.condition.text)}`
									)
									resource.forecast.forEach(item => {
										console.log(
											`${item.day}: ${chalk.green(item.low)}${chalk.green('F')} - ${chalk.green(item.high)}${chalk.green('F')} | ${chalk.green(item.text)}`
										)
									}, this)
									console.log('')
									console.log(chalk.yellow('Have a nice day~'))
								}
							}
						})
        	})
				} else {
					getweatherModel.location = res.data.content.address_detail.city
					axios.get(URL_FORECAST, {
						params: getweatherModel
					})
					.then(res => {
						if(res.status !== 200) {
							console.log(chalk.red('Whoops!!! There is something wrong with your network.'))
						} else {
							let resource = res.data
							if(resource.status !== 'success') {
								console.log(chalk.red('emmmmm... I don\'t know what happened.'))
							} else {
								console.log(
									`城市: ${chalk.green(resource.results[0].currentCity)} ❤️\n` +
									`日期: ${chalk.green(resource.date)}\n` +
									`pm2.5: ${chalk.green(resource.results[0].pm25)}`
								)
								resource.results[0].weather_data.forEach(item => {
									console.log(
										`${item.date.slice(0, 2)}: ${chalk.green(item.weather)} | ${chalk.green(item.temperature)}`
									)
								}, this)
								console.log('')
								console.log(chalk.yellow('Have a nice day~'))
							}
						}
					})
					.catch(error => {
						console.log(chalk.red('emmmmm... I don\'t know what happened.'))
					})
				}
			}
		})
		.catch(error => {
			console.log(chalk.red('emmmmm... I don\'t know what happened.'))
		})
	})
	.on('--help', () => {
		console.log('  Examples:')
		console.log('')
		console.log('$ happyday weather')
		console.log('$ happyday w')
	})
program.parse(process.argv)
