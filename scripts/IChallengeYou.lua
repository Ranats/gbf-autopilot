character_1:UseSkill(1)
    :UseSkill(2)
    :UseSkill(3)
    :UseSkill(4)
character_2:UseSkill(2)
    :UseSkill(1)
    :UseSkill(3)
    :UseSkill(4)
character_3:UseSkill(1)
    :UseSkill(3)
if character_2.hp_percentage < 80 then
    character_3:UseSkill(2)
end

character_4:UseSkill(1)
    :UseSkill(2)

function switch ()
    
end

my_turn = turn % 7

if my_turn == 1 then
    Summon(1)
end
if my_turn == 2 then
    Summon(2)
end
if my_turn == 3 then
    Summon(3)
end
if my_turn == 4 then
    Summon(4)
end
if my_turn == 5 then
    Summon(5)
end
if my_turn == 6 then
    Summon(6)
end

Attack()
Wait(2400)

--TerminateBattle()
--Refresh()