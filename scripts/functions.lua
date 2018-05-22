js = require 'js'

function success_handler(result)
  _running = false
  script:done(result)
  return coroutine.yield()
end

function error_handler(err)
  _running = false
  script:fail(err)
  return coroutine.yield()
end

function run_processes(processes, lastResult)
  if not _running then
    return nil
  end

  local processesArray = js.global:Array()
  for _, process in ipairs(processes) do
    processesArray:push(process)
  end

  local promise = _context:process(processesArray, lastResult)
  local co = coroutine.running()
  promise['then'](promise, function (self, result)
    coroutine.resume(co, result)
  end, function (self, err)
    coroutine.resume(co, nil, err)
  end)
  
  return coroutine.yield()
end

function Stop()
  run_processes({steps:Stop()})
end

function dofile(path)
  local func, loadErr = loadfile(path)
  if func == nil then
    return error_handler(loadErr)
  else
    local status, callErr = pcall(func)
    if not status then
      return error_handler(callErr)
    end
  end
  return true
end

function import(path)
  path = string.format('%s/%s', script.dir, path)
  return dofile(path)
end
