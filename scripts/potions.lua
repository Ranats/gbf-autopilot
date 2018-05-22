-- Green Potion Start
function UseGreenPotionOnPartyMember(member)
  refresh_state(run_processes({steps.Combat:UsePotion(1, member)}))
end

function IsGreenPotionAvailable()
  return tonumber(_state.potion.normal.small) > 0
end
-- Green Potion Finish

-- Clarity Herb Start
function UseClarityHerbOnPartyMember(member)
  refresh_state(run_processes({steps.Combat:UsePotion(5, member)}))
end

function IsClarityHerbAvailable()
  return tonumber(_state.potion.event.item['2'].number) > 0
end
-- Clarity Herb Finish

-- Blue Potion Start
function UseBluePotion()
  refresh_state(run_processes({steps.Combat:UsePotion(2)}))
end

function IsBluePotionAvailable()
  return tonumber(_state.potion.normal.large) > 0
end
-- Blue Potion Finish

-- Support Potion Start
function UseSupportPotion()
  refresh_state(run_processes({steps.Combat:UsePotion(4)}))
end

function IsSupportPotionAvailable()
  return tonumber(_state.potion.event.item['1'].number) > 0
end
-- Support Potion Finish

-- Full Elixir Start
function UseFullElixir()
  refresh_state(run_processes({steps.Combat:UsePotion(3)}))
end

function IsFullElixirAvailable()
  return tonumber(_state.potion.full.count) > 0
end
-- Full Elixir Finish

-- Revival Potion Start
function UseRevivalPotion()
  refresh_state(run_processes({steps.Combat:UsePotion(6)}))
end

function IsRevivalPotionAvailable()
  return tonumber(_state.potion.event.item['3'].number) > 0
end
-- Revival Potion Finish
