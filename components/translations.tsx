import { FC, useEffect, useState } from "react";

type Props = {
  path: string;
};

type Languages = {
  de: string;
  fr: string;
  it: string;
  en: string;
};

type Data = Record<string, Languages>;

const LanguageInput: FC<{
  initialValue: string;
}> = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <textarea
      style={{
        width: "400px",
      }}
      rows={1}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

const Translations: FC<Props> = ({ path }) => {
  const [translations, setTranslations] = useState<Data | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/translations?path=${encodeURIComponent(path)}`)
      .then((resp) => resp.json())
      .then(setTranslations);
  }, [path]);

  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Values</th>
        </tr>
      </thead>
      <tbody>
        {translations ? (
          Object.entries(translations).map(([key, values]) => (
            <tr>
              <td
                style={{
                  maxWidth: "300px",
                  wordWrap: "break-word",
                }}
              >
                {key}
              </td>
              <td>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "30px 1fr",
                    marginBottom: "8px",
                  }}
                >
                  {(["de", "fr", "it", "en"] as const).map((lang) => (
                    <>
                      <span
                        style={{
                          marginBottom: "4px",
                        }}
                      >
                        {lang}{" "}
                      </span>
                      <LanguageInput initialValue={values[lang]} />
                    </>
                  ))}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td>loading...</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Translations;
