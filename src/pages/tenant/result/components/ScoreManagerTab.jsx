import UploadScoresTab from './UploadScoresTab';

// Score Sheet used to be a second tab here, with its own full copy of every
// filter. It's now a standalone page (/result-scoresheet) reached from each
// subject's own "Score Sheet" button below — it already knows which
// subject/class/term it's for, so it no longer needs to live in this tab
// strip at all.
const ScoreManagerTab = () => <UploadScoresTab />;

export default ScoreManagerTab;
