const { spawn } = require('child_process')
const { Transform } = require('stream')
const { Buffer } = require('buffer')
const process = require('process')

const core = require('@actions/core')

class RecordStream extends Transform {
  constructor () {
    super()
    this._data = Buffer.from([])
  }

  get output () {
    return this._data
  }

  _transform (chunk, encoding, callback) {
    this._data = Buffer.concat([this._data, chunk])
    callback(null, chunk)
  }
}

try {
  const command = core.getInput('run')
  const shell = core.getInput('shell')

  const outRec = new RecordStream()
  const errRec = new RecordStream()

  // Run command
  const cmd = spawn(command, { shell })

  // Record stream output and pass it through main process
  cmd.stdout.pipe(outRec).pipe(process.stdout)
  cmd.stderr.pipe(errRec).pipe(process.stderr)

  cmd.on('close', code => {
    core.setOutput('stdout', outRec.output.toString())
    core.setOutput('stderr', errRec.output.toString())

    if (code !== 0) {
      core.setFailed(`Process completed with exit code ${code}.`)
    }
  })
} catch (error) {
  core.setFailed(error.message)
}
