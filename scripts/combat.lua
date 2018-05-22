function Summon(idx)
  refresh_state(run_processes({
    steps.Combat:Summon(idx, _state),
    steps.Timeout(1500)
  }))
end

function EnableChargeAttack()
  run_processes({steps.Combat:ChargeAttack(true)})
end

function DisableChargeAttack()
  run_processes({steps.Combat:ChargeAttack(false)})
end

function Wait(time)
  run_processes({steps:Timeout(time)})
end

function Retreat()
  run_processes({steps.Combat:Retreat()})
end

function Refresh()
  run_processes({
    steps.Location:Reload(),
    steps:Timeout(3000),
    steps:Wait('.btn-attack-start.display-on,.btn-result,.cnt-result')
  })
  refresh_state(true)
end

function Attack()
  refresh_state(run_processes({steps.Combat:Attack()}))
end

function SelectTarget(target)
  run_processes({steps.Combat:SelectTarget(target)})
end

function UseSticker(row, col)
  run_processes({steps.Combat:UseSticker(row, col)})
end

function RequestBackup(all, friend, guild)
  run_processes({steps.Combat:Backup(all, friend, guild)})
end
