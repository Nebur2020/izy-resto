import { useSettings } from '../../../../../../hooks';
import PizzaThemeEditor, { defaultConfig, PizzaThemeConfig } from './pizza';
import FoodThemeEditor, {
  FoodThemeConfig,
  defaultConfig as foodDefaultConfig,
} from './food';

type EditorProps = {
  theme: 'pizza' | 'modern' | 'minimal' | 'grid' | 'food';
};

const Editor = ({ theme }: EditorProps) => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const onSave = async (
    data:
      | {
          key: 'pizza';
          configuration: PizzaThemeConfig;
        }
      | {
          key: 'food';
          configuration: FoodThemeConfig;
        }
  ) => {
    const config = {
      ...settings,
      activeTheme: data, // Pass the typed data object directly
    };
    config['themes'] = {
      ...settings.themes,
      [data.key]: data.configuration,
    };
    await updateSettings(config);
  };

  switch (theme) {
    case 'pizza':
      return (
        <PizzaThemeEditor
          config={
            Object.keys(settings.activeTheme?.configuration || {}).length > 0
              ? (settings.activeTheme.configuration as PizzaThemeConfig)
              : settings.themes[theme] || defaultConfig
          }
          onSave={onSave}
        />
      );
    case 'food':
      const conf =
        Object.keys(settings.activeTheme?.configuration || {}).length > 0
          ? (settings.activeTheme.configuration as FoodThemeConfig)
          : settings.themes[theme] || foodDefaultConfig;
      return (
        <FoodThemeEditor
          config={conf?.banner?.images?.length > 0 ? conf : foodDefaultConfig}
          onSave={onSave}
        />
      );
    case 'modern':
      return <div>modern Editor</div>;
    case 'minimal':
      return <div>minimal Editor</div>;
    case 'grid':
      return <div>grid Editor</div>;
  }

  return <div>Not found</div>;
};

export default Editor;
