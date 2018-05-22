function apply_global_vars(state)
  _state = state
  battle = state.battle
  turn = state.turn
end

function update_state(state)
  logger:debug('Updating state')
  apply_global_vars(state)
  update_characters(state)
  update_enemies(state)
  logger:debug('State updated')
end

function init_state(state)
  logger:debug('Initializing state')
  apply_global_vars(state)
  init_characters(state)
  init_enemies(state)
  logger:debug('State initialized')
end

function check_state(state)
  local enemy_alive = 0
  for i, boss in pairs(state.enemies) do
    if boss.hp > 0 then 
      enemy_alive = enemy_alive + 1
    end
  end
  return enemy_alive > 0
end

function refresh_state(success)
  if success ~= true then
    return
  end

  local state, err = run_processes({
    steps.Battle:State(nil)
  })
  if err then
    logger:warn(err)
    return success_handler(false)
  end
  if state ~= nil and check_state(state) then
    update_state(state)
  else
    return success_handler(true)
  end
end
