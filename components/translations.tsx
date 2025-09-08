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
  deleteItem: () => void;
}> = ({ path, initialName, deleteItem }) => {
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
        rename key
      </button>
      <button
        onClick={() => {
          fetch("/api/translations", {
            method: "DELETE",
            body: JSON.stringify({
              path,
              key: oldName,
            }),
          }).then(deleteItem);
        }}
      >
        delete
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
  }, [scrollToNewTranslation]);

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
                  <KeyInput
                    path={path}
                    initialName={key}
                    deleteItem={() => {
                      const copy = { ...translations };
                      delete copy[key];
                      setTranslations(copy);
                    }}
                  />
                  <button onClick={() => {
                    navigator.clipboard.writeText(`intl.formatMessage({id: '${key}'})`)
                  }}>copy intl.formatMessage</button>
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(values));
                        }}
                      >
                        copy all
                      </button>
                      <button
                        onClick={async () => {
                          const text = await navigator.clipboard.readText();
                          try {
                            const value = JSON.parse(text);
                            if (
                              "de" in value &&
                              "en" in value &&
                              "fr" in value &&
                              "it" in value
                            ) {
                              setTranslations({
                                ...translations,
                                [key]: value,
                              });
                              for (const lang of ["de", "en", "it", "fr"]) {
                                fetch("/api/translations", {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    path,
                                    lang,
                                    key: key,
                                    value: value[lang],
                                  }),
                                }).catch((err) => alert(err.message));
                              }
                            }
                          } catch (e) {
                            console.warn(e);
                          }
                        }}
                      >
                        paste all
                      </button>
                    </div>
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
