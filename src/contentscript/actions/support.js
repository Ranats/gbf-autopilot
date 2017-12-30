import $ from "jquery";
import forEach from "lodash/forEach";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import {translateElement} from "./element";

export default {
  "support": function(summons, done, fail) {
    const supporters = $(".prt-supporter-attribute:not(.disableView) > .btn-supporter");
    const getSummonIndex = (id, name) => {
      var summonIndex = -1;
      forEach(summons, (summon, idx) => {
        const validId = isNumber(summon) && parseInt(summon) === id;
        const validName = isString(summon) && name.toLowerCase().indexOf(summon.toLowerCase()) >= 0;
        const valid = validId || validName;
        if (valid) {
          summonIndex = idx;
          return false;
        }
      });
      return summonIndex;
    };

    var element, selectedName, max = 0;
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
      const index = getSummonIndex(id, name);
      const base = index >= 0 ? summons.length - index : 0;
      // calculate from variables with least priority
      const score = (5 * plus / 99) +   // 5: start from the plus mark
        (10 * Number(isMax)) +          // 10: maybe useless but check if it's fully uncapped
        (25 * level / 150) +            // 25: prioritize based on the level
        (50 * rank / 2) +               // 50: next prioritize between none, MLB, and FLB
        (200 * base / summons.length);  // 200: the summon itself has the top priority
      
      if (score > max) {
        element = $el.find(".prt-supporter-info")[0];
        selectedName = name;
        max = score;
      }
    });

    if (!element) {
      return fail(new Error("No support found!"));
    }

    console.log("Selected support: '" + selectedName + "' with score " + max, element);
    translateElement(element, true).then((payload) => {
      payload.summon = selectedName;
      done(payload);
    }, fail);
  }
};
