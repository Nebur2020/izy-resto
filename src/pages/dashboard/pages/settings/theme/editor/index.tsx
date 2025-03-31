import { useSettings } from '../../../../../../hooks';
import PizzaThemeEditor, {
  defaultConfig as pizzaDefaultConfig,
  PizzaThemeConfig,
} from './pizza';
import FoodThemeEditor, { fooThemDefaultConfig, FoodThemeConfig } from './food';


type EditorProps = {
  theme: 'pizza' | 'modern' | 'minimal' | 'grid' | 'food';
};

const Editor = ({ theme }: EditorProps) => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const onSavePizza = async (data: {
    key: 'pizza';
    configuration: PizzaThemeConfig;
  }) => {
    await updateSettings({
      ...settings,
      activeTheme: {
        key: data.key,
        configuration: data.configuration,
      },
      themes: {
        ...settings.themes,
        pizza: data.configuration,
      },
    });
  };

  const onSaveFood = async (data: {
    key: 'food';
    configuration: FoodThemeConfig;
  }) => {
    await updateSettings({
      ...settings,
      activeTheme: {
        key: data.key,
        configuration: data.configuration,
      },
      themes: {
        ...settings.themes,
        food: data.configuration,
      },
    });
  };

  switch (theme) {
    case 'pizza':
      return (
        <PizzaThemeEditor
          config={
            Object.keys(settings.activeTheme?.configuration || {}).length > 0
              ? (settings.activeTheme.configuration as PizzaThemeConfig)
              : settings.themes.pizza || pizzaDefaultConfig
          }
          onSave={onSavePizza}
        />
      );
    case 'food':
      return (
        <FoodThemeEditor
          config={
            Object.keys(settings.activeTheme?.configuration || {}).length > 0
              ? (settings.activeTheme.configuration as FoodThemeConfig)
              : settings.themes.food || fooThemDefaultConfig
          }
          onSave={onSaveFood}
        />
      );
    case 'food':
      return (
        <FoodThemeEditor
          config={
            Object.keys(settings.activeTheme?.configuration || {}).length > 0
              ? (settings.activeTheme.configuration as PizzaThemeConfig)
              : settings.themes[theme] || defaultConfig
          }
          onSave={onSave}
        />
      );
    case 'modern':
      return <div>Modern Editor</div>;
    case 'minimal':
      return <div>Minimal Editor</div>;
    case 'grid':
      return <div>Grid Editor</div>;
    default:
      return <div>Not found</div>;
  }
};

export default Editor;
