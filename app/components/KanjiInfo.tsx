type Props = {
  kanji: {
    kanji: string;
    kunyomi: string;
    meaning: string;
    onyomi: string;
    stories: string[];
    vocabulary: string;
  };
};

const KanjiInfo: React.FC<Props> = ({ kanji }) => {
  return (
    <div className="space-y-4">
      <h2 className="font-bold">Meanings:</h2> {kanji.meaning}
      <h2 className="font-bold">Reading On:</h2> {kanji.kunyomi}
      <h2 className="font-bold">Reading Kun:</h2> {kanji.onyomi}
      <h2 className="font-bold">Mnemonics:</h2>
      <ul className="space-y-3">
        {kanji.stories.map((story, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: story }} />
        ))}
      </ul>
      <h2 className="font-bold">Vocabulary:</h2>
      <span dangerouslySetInnerHTML={{ __html: kanji.vocabulary }} />
    </div>
  );
};

export default KanjiInfo;
