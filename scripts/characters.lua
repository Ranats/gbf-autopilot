function get_character_by_index(idx)
  local varname = string.format('character_%d', idx)
  return _G[varname] or nil
end

function set_character_by_index(idx, character)
  local varname = string.format('character_%d', idx)
  _G[varname] = character
end

function update_character(idx, chara, character)
  character.idx = idx
  character.name = chara.name
  character.skill_1_available = false
  character.skill_2_available = false
  character.skill_3_available = false
  character.skill_4_available = false

  character.hp = chara.hp
  character.max_hp = chara.hpMax
  character.hp_percentage = chara.hp / chara.hpMax * 100
  character.charge_gauge = chara.ougi
  character.is_alive = chara.alive

  character.HasStatusEffect = function (self, id)
    id = tostring(id)
    for _, effectId in pairs(chara.buffs) do
      if id == effectId then return true end
    end
    for _, effectId in pairs(chara.debuffs) do
      if id == effectId then return true end
    end
    return false
  end

  if chara.skills then
    for i, skill in pairs(chara.skills) do
      local idx = i + 1
      local key = string.format('skill_%d_available', idx)
      character[key] = skill.available
    end
  end

  if idx > 0 then
    characters[character.name] = character
    g_character = get_character_by_index(idx)
    if g_character ~= nil and g_character.name ~= character.name then
      g_character.is_alive = false
    end
    set_character_by_index(idx, character)
  end

  return character
end

function create_character(idx, chara)
  local skill_target = nil
  local character = {
    WithWaitTime = function (self, time)
      refresh_state(run_processes({
        steps:Timeout(time)
      }, true))
      return self
    end,
  
    UseSkill = function (self, skill_idx)
      refresh_state(run_processes({
        steps.Combat:UseSkill(idx, skill_idx, skill_target, _state)
      }))
      return self
    end,

    OnPartyMember = function (self, member)
      skill_target = member
      return self
    end,

    UseGreenPotion = function (self)
      UseGreenPotionOnPartyMember(idx)
      return self
    end,

    UseClarityHerb = function (self)
      UseClarityHerbOnPartyMember(idx)
      return self
    end
  }

  return update_character(idx, chara, character)
end

function init_characters(state)
  characters = {}
  character_empty = create_character(0, {
    name = '',
    skills = {
      {available = false},
      {available = false},
      {available = false},
      {available = false}
    },
    hp = 0,
    hpMax = 1,
    ougi = 0,
    alive = false
  })
  character_1 = character_empty
  character_2 = character_empty
  character_3 = character_empty
  character_4 = character_empty

  for i, chara in pairs(state.party) do
    local idx = i + 1
    create_character(idx, chara)
  end
end

function update_characters(state)
  for i, chara in pairs(state.party) do
    local idx = i + 1
    local character = get_character_by_index(idx)
    update_character(idx, chara, character)
  end
end
