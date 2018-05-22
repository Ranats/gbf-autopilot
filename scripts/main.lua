co = coroutine.create(function ()
  logger:debug('Running script:', script.path)

  local func, err = loadfile(script.path)
  if not func then
    return error_handler(err)
  end

  init_state(_state)
  local status, err = pcall(func)
  if not status then
    return error_handler(err)
  else
    return success_handler(true)
  end
end)
coroutine.resume(co)
