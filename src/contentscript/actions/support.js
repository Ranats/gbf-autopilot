import $ from "jquery";
import forEach from "lodash/forEach";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import {translateElement} from "./element";

export default {
  "support": function(summons, done, fail) {
    summons = summons.map((summon, index) => {
      const parts = summon.split("_");
      return {
        index,
        id: parts[0],
        rank: parts[1] || 0
      };
    });

    const supporters = $(".prt-supporter-attribute:not(.disableView) > .btn-supporter");
    const getSummon = (id, name) => {
      var selectedSummon = {
        index: -1,
        id: "none",
        rank: 0
      };

      forEach(summons, (summon) => {
        const validId = isNumber(summon.id) && parseInt(summon.id) === id;
        const validName = isString(summon.id) && name.toLowerCase().indexOf(summon.id.toLowerCase()) >= 0;
        const valid = validId || validName;
        if (valid) {
          selectedSummon = summon;
          return false;
        }
      });

      return selectedSummon;
    };

    var element;
    var selectedId, selectedName, selectedRank;
    var max = 0, preferred = true;
    supporters.each((idx, el) => {
      const $el = $(el);

      // gather some data
      const id = Number($el.find(".prt-summon-image").attr("data-image"));
      const isMax = !!$el.find(".prt-summon-max").length;
      const title = $el.find(".prt-supporter-summon")
        .text().trim()
        .match(/^(Lvl|Lv)\s+(\d+)\s+(.+)/);
      
      const level = Number(title[2]);
      const name = title[3];

      const $skill = $el.find(".prt-summon-skill");
      const rank = $skill.hasClass("bless-rank2-style") ? 2 :
        ($skill.hasClass("bless-rank1-style") ? 1 : 0);

      const $quality = $el.find(".prt-summon-quality");
      const plus = $quality.length ? Number($quality.text().trim().substr(1)) : 0;

      // start calculating score
      const summon = getSummon(id, name);
      const index = summon.index;
      const base = (index >= 0 ? summons.length - index : 0) * (rank >= summon.rank ? 1 : 0);
      // calculate from variables with least priority
      const score = (5 * plus / 99) +   // 5: start from the plus mark
        (10 * Number(isMax)) +          // 10: maybe useless but check if it's fully uncapped
        (25 * level / 150) +            // 25: prioritize based on the level
        (50 * rank / 2) +               // 50: next prioritize between none, MLB, and FLB
        (200 * base);                   // 200: the summon itself has the top priority
      
      if (score > max) {
        selectedId = id;
        selectedName = name;
        selectedRank = rank;
        preferred = index >= 0 && rank >= summon.rank;
        element = $el.find(".prt-supporter-info")[0];
        max = score;
      }
    });

    if (!element) {
      return fail(new Error("No support found!"));
    }

    translateElement(element, true).then((payload) => {
      console.log("Selected support: '" + selectedName + "' with score " + max, element, payload);
      payload.summonId = selectedId;
      payload.preferred = preferred;
      payload.summon = selectedName;
      payload.rank = selectedRank;
      payload.score = max;
      done(payload);
    }, fail);
  }
};
