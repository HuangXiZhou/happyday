#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const axios = require('axios')

const key = {
	ak: '8PLvkWpF06CnaSu72BBsmyIHowbf76Lr'
}

let getweatherModel = {
	location: '',
	output: 'json',
	ak: key.ak,
}

program
	.command('weather')
	.alias('w')
	.description(chalk.green('Get weather forecast ;)'))
	.action(option => {
		axios.get('http://api.map.baidu.com/location/ip', {
			params: key
		})
		.then(res => {
			if(res.status !== 200) {
				console.log(chalk.red('Whoops!!! There is something wrong with your network.'))
			} else {
				if(res.data.status !== 0) {
					console.log(chalk.red('Oye!!! You are in abroad.'))
				} else {
					getweatherModel.location = res.data.content.address_detail.city
					axios.get('http://api.map.baidu.com/telematics/v3/weather', {
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
