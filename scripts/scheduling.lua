function RepeatQuest(questPage, ap, repeatCount)
  run_processes({
    _repeatQuest(questPage, ap, repeatCount)
  })
end

co = coroutine.create(function ()
  logger:debug('Running script:', script.path)
  local result, err = loadfile(script.path)

  if result == nil then
    logger:error(err)
    script:fail(err)
  else
    result()
    script:done()
  end
end)
coroutine.resume(co)
