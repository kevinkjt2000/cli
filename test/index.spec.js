/* eslint-env jest */
const microcli = require('../index')

describe('microcli', () => {
  let callback, logger

  beforeEach(() => {
    callback = jest.fn()
    logger = {
      log: jest.fn(),
      error: jest.fn()
    }
  })

  describe('without annotations given', () => {
    it('executes callback with params and options', () => {
      microcli(['node', 'scriptname', '--foo=bar', '-a', 'abc', 'def'], null, null, logger)(callback)
      expect(callback).toHaveBeenCalledWith({a: true, foo: 'bar'}, 'abc', 'def')
      expect(logger.log).not.toHaveBeenCalled()
    })

    it('prints info that there is no documentation', () => {
      microcli(['node', 'scriptname', '--help'], null, null, logger)(callback)
      expect(logger.log.mock.calls).toEqual([
        ['Documentation not found'],
      ])
    })
  })

  describe('with string annotation given', () => {
    const annotation = 'General script description'

    it('prints basic help', () => {
      microcli(['node', 'path/scriptname', '--help'], annotation, null, logger)(callback)
      expect(logger.log.mock.calls).toEqual([
        ['Usage: scriptname  \n'],
        ['General script description\n'],
      ])
    })

    it('executes callback with params and options', () => {
      microcli(['node', 'scriptname', '--foo=bar', '-a', 'abc', 'def'], annotation, null, logger)(callback)
      expect(callback).toHaveBeenCalledWith({a: true, foo: 'bar'}, 'abc', 'def')
      expect(logger.log).not.toHaveBeenCalled()
    })
  })

  describe('with annotations given', () => {
    let annotations

    beforeEach(() => {
      annotations = {
        description: 'General script description',
        params: ['abc', 'def'],
        options: {
          a: 'description for a option',
          foo: 'description for foo option'
        }
      }
    })

    it('executes callback with params and options', () => {
      microcli(['node', 'scriptname', '--foo=bar', '-a', 'abc', 'def'], annotations, null, logger)(callback)
      expect(callback).toHaveBeenCalledWith({a: true, foo: 'bar'}, 'abc', 'def')
      expect(logger.log).not.toHaveBeenCalled()
    })

    it('prints basic help', () => {
      microcli(['node', 'path/scriptname', '--help'], annotations, null, logger)(callback)
      expect(logger.log.mock.calls).toEqual([
        ['Usage: scriptname [options] [abc def]\n'],
        ['General script description\n'],
        ['Options:\n'],
        ['  -a          description for a option'],
        ['  --foo       description for foo option']
      ])
    })

    it('logs error if option name is incorrect', () => {
      microcli(['node', 'path/scriptname', '--abc'], annotations, null, logger)(callback)
      expect(callback).not.toHaveBeenCalled()
      expect(logger.error.mock.calls).toEqual([
        ['Illegal option: --abc'],
        ['Available options: -a --foo'],
        ['Type "scriptname --help" for more information']
      ])
    })

    describe('and custom annotation', () => {
      beforeEach(() => {
        annotations['examples'] = 'examples content'
      })

      it('prints help with custom annotation', () => {
        microcli(['node', 'path/scriptname', '--help'], annotations, null, logger)(callback)
        expect(logger.log.mock.calls).toEqual([
          ['Usage: scriptname [options] [abc def]\n'],
          ['General script description\n'],
          ['Options:\n'],
          ['  -a          description for a option'],
          ['  --foo       description for foo option'],
          ['\nExamples:\n'],
          ['examples content\n']
        ])
      })

      describe('with help formatting function', () => {
        let help

        beforeEach(() => {
          help = jest.fn()
        })

        it('executes callback with params and options', () => {
          microcli(['node', 'scriptname', '--foo=bar', '-a', 'abc', 'def'], annotations, help, logger)(callback)
          expect(callback).toHaveBeenCalledWith({a: true, foo: 'bar'}, 'abc', 'def')
          expect(logger.log).not.toHaveBeenCalled()
        })

        it('calls provided help function to handle annotations', () => {
          microcli(['node', 'scriptname', '--help'], annotations, help, logger)(callback)
          expect(help).toHaveBeenCalledWith('scriptname', annotations, logger)
          expect(help).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})
