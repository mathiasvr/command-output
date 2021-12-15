# Command Output

A `run` alternative that stores command output in a variable.

## Inputs

### `run`

**Required** The command to run.

### `shell`

The shell used to run command.

## Outputs

### `stdout`

The output of the command written to stdout.

### `stderr`

The output of the command written to stderr.

## Example usage

#### Store today's date in variable

```yaml
steps:
- name: Get today's date
  uses: mathiasvr/command-output@v1
  id: today
  with:
    run: date +'%Y-%m-%d'

- run: echo Today is ${{ steps.today.outputs.stdout }}
```

#### Use stdout and stderr output as condition

```yaml
steps:
- name: Read file if it exists?
  uses: mathiasvr/command-output@v1
  continue-on-error: true
  id: cmd
  with:
    run: cat unknown.txt

- run: echo Command succeeded
  if: ${{ steps.cmd.outputs.stdout }}

- run: echo Command failed
  if: ${{ steps.cmd.outputs.stderr }}
```


