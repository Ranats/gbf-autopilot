function get_enemy_by_index(idx)
  local varname = string.format('enemy_%d', idx)
  return _G[varname]
end

function set_enemy_by_index(idx, enemy)
  local varname = string.format('enemy_%d', idx)
  _G[varname] = enemy;
end

function update_enemy(idx, boss, enemy)
  local lang = _config.General.Language
  if lang == "jp" then lang = "ja" end
  enemy.id = boss.id
  enemy.name = boss.name[lang]
  enemy.hp = boss.hp
  enemy.max_hp = boss.hpMax
  enemy.hp_percentage = boss.hp / boss.hpMax * 100
  enemy.charge_diamonds = boss.recastMax - boss.recast
  enemy.is_alive = boss.hp > 0
  enemy.overdrive_state = boss.mode == 2
  enemy.break_state = boss.mode == 3

  enemy.HasStatusEffect = function (self, id)
    id = tostring(id)
    for _, effectId in pairs(boss.conditions) do
      if id == effectId then return true end
    end
    return false
  end
  set_enemy_by_index(idx, enemy)

  return enemy
end

function create_enemy(idx, boss)
  local enemy = {}
  return update_enemy(idx, boss, enemy)
end

function init_enemies(state)
  enemy_1 = nil
  enemy_2 = nil
  enemy_3 = nil

  for i, boss in pairs(state.enemies) do
    local idx = i + 1
    create_enemy(idx, boss)
  end
end

function update_enemies(state)
  for i, boss in pairs(state.enemies) do
    local idx = i + 1
    create_enemy(idx, boss)
  end
end
