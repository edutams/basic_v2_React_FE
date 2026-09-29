import TemplateOne from './TemplateOne';
import TemplateTwo from './TemplateTwo';
import TemplateThree from './TemplateThree';
import TemplateFour from './TemplateFour';
import TemplateFive from './TemplateFive';
import TemplateSix from './TemplateSix';
import TemplateSeven from './TemplateSeven';
import TemplateEight from './TemplateEight';
import TemplateNine from './TemplateNine';
import TemplateTen from './TemplateTen';
import TemplateEleven from './TemplateEleven';
import TemplateTwelve from './TemplateTwelve';
import TemplateThirteen from './TemplateThirteen';

const resultTemplates = [
  TemplateOne, TemplateTwo, TemplateThree, TemplateFour, TemplateFive,
  TemplateSix, TemplateSeven, TemplateEight, TemplateNine, TemplateTen,
  TemplateEleven, TemplateTwelve, TemplateThirteen,
];

export const getResultTemplate = (index) => {
  const idx = Math.max(0, Math.min(index, resultTemplates.length - 1));
  return resultTemplates[idx];
};

export {
  TemplateOne, TemplateTwo, TemplateThree, TemplateFour, TemplateFive,
  TemplateSix, TemplateSeven, TemplateEight, TemplateNine, TemplateTen,
  TemplateEleven, TemplateTwelve, TemplateThirteen,
};

export default resultTemplates;
