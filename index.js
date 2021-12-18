const { spawn } = require('child_process')
const { Transform } = require('stream')
const { Buffer } = require('buffer')
const process = require('process')

const core = require('@actions/core')

// Default shell invocation used by GitHub Action 'run:'
const shellArgs = {
  bash: ['--noprofile', '--norc', '-eo', 'pipefail', '-c'],
  sh: ['-e', '-c'],
  python: ['-c'],
  pwsh: ['-command', '.'],
  powershell: ['-command', '.']
}

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

function run (command, shell) {
  return new Promise((resolve, reject) => {
    const outRec = new RecordStream()
    const errRec = new RecordStream()

    const args = shellArgs[shell]

    if (!args) {
      return reject(new Error(`Option "shell" must be one of: ${Object.keys(shellArgs).join(', ')}.`))
    }

    // Execute the command
    const cmd = spawn(shell, [...args, command])

    // Record stream output and pass it through main process
    cmd.stdout.pipe(outRec).pipe(process.stdout)
    cmd.stderr.pipe(errRec).pipe(process.stderr)

    cmd.on('error', error => reject(error))

    cmd.on('close', code => {
      core.setOutput('stdout', outRec.output.toString())
      core.setOutput('stderr', errRec.output.toString())

      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process completed with exit code ${code}.`))
      }
    })
  })
}

run(core.getInput('run'), core.getInput('shell'))
  .catch(error => core.setFailed(error.message))
