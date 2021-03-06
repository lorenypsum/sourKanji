type Props = {
  meaning: string;
  kunyomi: string;
  onyomi: string;
  stories: string[];
  vocabulary: string;
};

const KanjiInfo: React.FC<Props> = (props) => {
  return (
    <div className="space-y-4">
      <h2 className="font-bold">Meanings:</h2> {props.meaning}
      <h2 className="font-bold">Reading On:</h2> {props.kunyomi}
      <h2 className="font-bold">Reading Kun:</h2> {props.onyomi}
      <h2 className="font-bold">Mnemonics:</h2>
      <ul className="space-y-3">
        {props.stories.map((story, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: story }} />
        ))}
      </ul>
      <h2 className="font-bold">Vocabulary:</h2>
      <span dangerouslySetInnerHTML={{ __html: props.vocabulary }} />
    </div>
  );
};

export default KanjiInfo;
