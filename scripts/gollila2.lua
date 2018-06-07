if enemy_1.hp_percentage == 100 then
    UseSticker(3,2)
end

character_1:UseSkill(4)
:UseSkill(1)

if character_1.hp_percentage < 50 or character_2.hp_percentage < 50 then
    character_1:UseSkill(2)
end
    
character_2:UseSkill(1)
    :UseSkill(2)
    :UseSkill(3)
    :UseSkill(4)
    
character_3:UseSkill(1)
    :UseSkill(2)
    
character_4:UseSkill(2)
    :UseSkill(1)

--if summon_1_available then
    Summon(1)
--end
--if summon_2_available then
    Summon(2)
--end

if turn > 7  then
    Summon(3)
    Summon(5)
end
--if summon_4_available then
    Summon(4)
--end
--if summon_5_available then
--end
--if summon_6_available then
    Summon(6)

--gbf-autopilot\node_modules\gbf-autopilot-core\src\server\steps
if enemy_1.hp_percentage < 50 then
    RequestBackup(true,true,false)
end

Attack()
Wait(2400)

if enemy_1.hp_percentage == 0 then
    TerminateBattle()
end
    --Refresh()