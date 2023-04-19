import ipc from 'node-ipc'

export default class Server {
	/**
	 * @param  {{id: string, debug?: boolean}} config
	 * @param  {{[name: string]: (input: any, callback: (error: any, output: any) => void) => void}} methodsMap
	 * @return {void}
	 */
	constructor(config, methodsMap) {
		ipc.config.id = config.id
		ipc.config.retry = 1500
		ipc.config.silent = !config.debug
		ipc.config.logInColor = true

		// add listener
		ipc.serve(() => ipc.log('[Info] Service is started.'))
		ipc.server.on('stop', () => ipc.server.stop())

		// register method
		Object.keys(methodsMap).forEach(methodName => {
			ipc.log('[Info] Register method: ', methodName)
			const method = methodsMap[methodName]

			ipc.server.on(methodName, (input, socket) => {
				ipc.log('[Info] Received: ', methodName, input)
				method(input, (error, output) => {
					ipc.server.emit(socket, methodName, { error, response: output })
				})
			})
		})
	}

	start() {
		return new Promise(resolve => {
			ipc.server.start()
			ipc.server.on('start', () => resolve())
		})
	}

	stop() {
		return new Promise(resolve => {
			ipc.server.stop()
			resolve()
		})
	}
}