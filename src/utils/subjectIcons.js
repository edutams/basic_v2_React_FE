import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TranslateIcon from '@mui/icons-material/Translate';
import ComputerIcon from '@mui/icons-material/Computer';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import GrassIcon from '@mui/icons-material/Grass';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';

/**
 * Shared by every timetable grid (Generate Timetable, My Timetable,
 * Teacher View) so a subject gets the same icon everywhere it appears,
 * instead of each page guessing its own mapping.
 */
const SUBJECT_ICON_RULES = [
  [/math/i, CalculateIcon],
  [/english|literature/i, MenuBookIcon],
  [/science|biology|chemistry|physics/i, ScienceIcon],
  [/geography/i, PublicIcon],
  [/government|civic/i, AccountBalanceIcon],
  [/physical|health|sport/i, FitnessCenterIcon],
  [/french|yoruba|igbo|hausa|language/i, TranslateIcon],
  [/computer|ict/i, ComputerIcon],
  [/creative|art|music/i, PaletteIcon],
  [/religio|bible|quran|islamic|christian/i, AutoStoriesIcon],
  [/business|commerce|account/i, BusinessCenterIcon],
  [/history/i, HistoryEduIcon],
  [/agric/i, GrassIcon],
];

export const getSubjectIcon = (name = '') => (SUBJECT_ICON_RULES.find(([re]) => re.test(name)) || [])[1] || MenuBookIcon;

export const getBreakIcon = (label = '') => (/lunch/i.test(label) ? RestaurantIcon : LocalCafeIcon);
