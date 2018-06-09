if enemy_1.hp_percentage == 100 then
    UseSticker(3,2)
end

character_1:UseSkill(4)
:UseSkill(1)
:UseSkill(3)

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

Summon(1)
Summon(2)
Summon(4)
Summon(6)

if turn > 7 then
    Summon(3)
    Summon(5)
end

-- functions => ..\node_modules\gbf-autopilot-core\src\server\steps
--RequestBackup()
Attack()
Wait(2400)