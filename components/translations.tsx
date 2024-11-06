import { FC, Fragment, useEffect, useRef, useState } from "react";
import { stripProject } from "@/util/strip";

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
  path: string;
  lang: string;
  theKey: string;
  initialValue: string;
}> = ({ initialValue, path, lang, theKey }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <textarea
      style={{
        width: "400px",
      }}
      rows={1}
      value={value}
      onChange={(e) => {
        fetch("/api/translations", {
          method: "PATCH",
          body: JSON.stringify({
            path,
            lang,
            key: theKey,
            value: e.target.value,
          }),
        }).catch((err) => alert(err.message));
        setValue(e.target.value);
      }}
    />
  );
};

const KeyInput: FC<{
  path: string;
  initialName: string;
}> = ({ path, initialName }) => {
  const [oldName, setOldName] = useState(initialName);
  const [name, setName] = useState(initialName);
  useEffect(() => {
    setOldName(initialName);
    setName(initialName);
  }, [initialName]);

  return (
    <>
      <textarea
        cols={36}
        rows={2}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={() => {
          fetch("/api/translations", {
            method: "PATCH",
            body: JSON.stringify({
              path,
              key: oldName,
              newKey: name,
            }),
          });
        }}
      >
        OK
      </button>
    </>
  );
};

const Translations: FC<Props> = ({ path }) => {
  const topElement = useRef<HTMLHeadingElement>(null);

  const newTranslationRef = useRef<HTMLTableRowElement>(null);
  const [scrollToNewTranslation, setScrollToNewTranslation] = useState(0);

  const [newTranslationKey, setNewTranslationKey] = useState("");
  const [translations, setTranslations] = useState<Data | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/translations?path=${encodeURIComponent(path)}`)
      .then((resp) => resp.json())
      .then(setTranslations);
  }, [path]);

  useEffect(() => {
    if (newTranslationRef.current && scrollToNewTranslation) {
      newTranslationRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollToNewTranslation, newTranslationRef.current]);

  const translationEntries = translations && Object.entries(translations);

  return (
    <>
      <h2 ref={topElement} style={{ marginBottom: "16px" }}>
        {stripProject(path)}
      </h2>
      <input
        style={{
          height: "30px",
          width: "200px",
          marginRight: "4px",
        }}
        value={newTranslationKey}
        onChange={(e) => setNewTranslationKey(e.target.value)}
      />
      <button
        style={{
          height: "30px",
          width: "150px",
        }}
        onClick={() => {
          if (!newTranslationKey) {
            return;
          }
          setTranslations({
            ...translations,
            [newTranslationKey]: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
          });
          setScrollToNewTranslation((prev) => prev + 1);
        }}
      >
        New Translation
      </button>
      <table
        style={{
          marginTop: "8px",
        }}
      >
        <thead>
          <tr>
            <th>Key</th>
            <th>Values</th>
          </tr>
        </thead>
        <tbody>
          {translationEntries ? (
            translationEntries.map(([key, values], idx) => (
              <tr
                key={key}
                {...(idx === translationEntries.length - 1
                  ? { ref: newTranslationRef }
                  : {})}
              >
                <td
                  style={{
                    maxWidth: "300px",
                    wordWrap: "break-word",
                    paddingRight: "16px",
                  }}
                >
                  <KeyInput path={path} initialName={key} />
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
                      <Fragment key={lang}>
                        <span
                          style={{
                            marginBottom: "4px",
                          }}
                        >
                          {lang.toUpperCase()}{" "}
                        </span>
                        <LanguageInput
                          initialValue={values[lang]}
                          theKey={key}
                          lang={lang}
                          path={path}
                        />
                      </Fragment>
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
      <button
        onClick={() =>
          topElement.current?.scrollIntoView({ behavior: "smooth" })
        }
        style={{
          height: "30px",
          width: "150px",
        }}
      >
        Return to top
      </button>
    </>
  );
};

export default Translations;
