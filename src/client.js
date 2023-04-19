import ipc from 'node-ipc'

export default class Client {
	/**
	 * @param  {{id: string, debug?: boolean}} config
	 * @return {void}
	 */
	constructor(config) {
		ipc.config.id = config.id
		ipc.config.retry = 1500
		ipc.config.silent = !config.debug
		ipc.config.logInColor = true
	}

	command(methodName, input) {
		return new Promise((resolve, reject) => {
			const serverId = ipc.config.id

			ipc.connectTo(serverId, () => {
				const server = ipc.of[serverId]

				server.on('connect', () => {
					ipc.log(`[Info] Connected to ${serverId}.`)
					server.emit(methodName, input)
				})

				server.on(methodName, ({ error, response }) => {
					ipc.disconnect(serverId)
					ipc.log(`[Info] Response ${serverId}:${methodName}`, error, response)
					resolve(response)
				})

				server.on('error', error => {
					ipc.log(`[Error] `, error)
					reject(error)
				})

				server.on('disconnect', (...args) => {
					ipc.log('disconnect', args)
				})
			})
		})
	}
}