import React from "react";
import useAuthStore from "@/store/authStore";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Link, router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import countries from "world-countries";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Circle,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { City as CSCity, State as CSState } from "country-state-city";

import { AppButton, BRAND_GRADIENT } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { TelifierLogo } from "@/components/shared/TelifierLogo";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

// Same accent pairing as the welcome screen and the login screen — one
// small shared vocabulary across every auth-adjacent screen instead of
// each one inventing its own.
const HIGHLIGHT = { dark: "#5EEAD4", light: "#0D9488" };

type LocationOption = {
  name: string;
  code: string;
};

type CountryOption = {
  name: string;
  isoCode: string;
  callingCode: string;
};

const countryOptions: CountryOption[] = countries
  .map((item) => {
    const suffix = item.idd?.suffixes?.[0] ?? "";
    const callingCode = item.idd?.root ? `${item.idd.root}${suffix}` : "";

    return {
      name: item.name.common,
      isoCode: item.cca2,
      callingCode,
    };
  })
  .filter((item) => item.callingCode)
  .sort((a, b) => a.name.localeCompare(b.name));

const months = [
  { label: "Jan", value: 0 },
  { label: "Feb", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Apr", value: 3 },
  { label: "May", value: 4 },
  { label: "Jun", value: 5 },
  { label: "Jul", value: 6 },
  { label: "Aug", value: 7 },
  { label: "Sep", value: 8 },
  { label: "Oct", value: 9 },
  { label: "Nov", value: 10 },
  { label: "Dec", value: 11 },
];

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function FlagImage({ isoCode, size = 24 }: { isoCode: string; size?: number }) {
  return (
    <Image
      source={{ uri: `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png` }}
      style={[
        styles.flagImage,
        {
          width: size,
          height: Math.round(size * 0.68),
        },
      ]}
      resizeMode="cover"
    />
  );
}

function PasswordRule({ passed, label }: { passed: boolean; label: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.rule}>
      {passed ? (
        <CheckCircle2 color={colors.success} size={15} />
      ) : (
        <Circle color={colors.textSoft} size={15} />
      )}

      <AppText
        style={[
          styles.ruleText,
          { color: passed ? colors.success : colors.textMuted },
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

function StepIndicator({ step, colors }: { step: 1 | 2; colors: any }) {
  return (
    <View style={styles.stepWrap}>
      <View style={styles.stepLabels}>
        <AppText
          style={[
            styles.stepLabel,
            { color: step === 1 ? colors.primary : colors.textMuted },
          ]}
        >
          Account
        </AppText>
        <AppText
          style={[
            styles.stepLabel,
            { color: step === 2 ? colors.primary : colors.textMuted },
          ]}
        >
          Profile
        </AppText>
      </View>

      <View style={styles.stepRow}>
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.stepDot}
        />

        {step === 2 ? (
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stepLine}
          />
        ) : (
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
        )}

        {step === 2 ? (
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stepDot}
          />
        ) : (
          <View
            style={[
              styles.stepDot,
              { backgroundColor: colors.border },
            ]}
          />
        )}
      </View>
    </View>
  );
}

function FieldGroup({
  label,
  style,
  children,
}: {
  label: string;
  style?: any;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.fieldGroup, style]}>
      <AppText style={[styles.fieldLabel, { color: colors.textMuted }]}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  disabled,
  leftSlot,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  leftSlot: React.ReactNode;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <FieldGroup label={label}>
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.selectField,
          {
            backgroundColor: disabled ? `${colors.border}22` : colors.surface,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <View style={styles.selectLeft}>
          {leftSlot}

          <AppText
            numberOfLines={1}
            style={[
              styles.selectValue,
              { color: value ? colors.text : colors.textMuted },
            ]}
          >
            {value || placeholder}
          </AppText>
        </View>

        <ChevronDown color={colors.textSoft} size={18} />
      </TouchableOpacity>
    </FieldGroup>
  );
}

function WebDatePickerModal({
  visible,
  value,
  maximumDate,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date | null;
  maximumDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}) {
  const { colors } = useAppTheme();

  const initialDate = value ?? maximumDate;
  const [year, setYear] = React.useState(initialDate.getFullYear());
  const [month, setMonth] = React.useState(initialDate.getMonth());
  const [day, setDay] = React.useState(initialDate.getDate());

  React.useEffect(() => {
    if (!visible) return;

    const nextDate = value ?? maximumDate;
    setYear(nextDate.getFullYear());
    setMonth(nextDate.getMonth());
    setDay(nextDate.getDate());
  }, [maximumDate, value, visible]);

  const years = React.useMemo(() => {
    const maxYear = maximumDate.getFullYear();
    return Array.from({ length: 100 }, (_, index) => maxYear - index);
  }, [maximumDate]);

  const days = React.useMemo(() => {
    return Array.from(
      { length: daysInMonth(year, month) },
      (_, index) => index + 1,
    );
  }, [month, year]);

  React.useEffect(() => {
    const maxDay = daysInMonth(year, month);
    if (day > maxDay) setDay(maxDay);
  }, [day, month, year]);

  const handleDone = () => {
    const selectedDate = new Date(year, month, day);

    if (selectedDate > maximumDate) {
      onSelect(maximumDate);
      return;
    }

    onSelect(selectedDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View
            style={[styles.modalGrabber, { backgroundColor: colors.border }]}
          />

          <View style={styles.modalHeader}>
            <AppText style={[styles.modalTitle, { color: colors.text }]}>
              Select date of birth
            </AppText>

            <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
              <AppText style={[styles.modalClose, { color: colors.primary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerGrid}>
            <DateColumn title="Day" data={days} value={day} onSelect={setDay} />
            <DateColumn
              title="Month"
              data={months}
              value={month}
              getLabel={(item) => item.label}
              getValue={(item) => item.value}
              onSelect={setMonth}
            />
            <DateColumn
              title="Year"
              data={years}
              value={year}
              onSelect={setYear}
            />
          </View>

          <AppButton
            title="Use selected date"
            variant="gradient"
            gradientColors={BRAND_GRADIENT}
            onPress={handleDone}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DateColumn<T>({
  title,
  data,
  value,
  getLabel,
  getValue,
  onSelect,
}: {
  title: string;
  data: T[];
  value: number;
  getLabel?: (item: T) => string;
  getValue?: (item: T) => number;
  onSelect: (value: number) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.dateColumn}>
      <AppText style={[styles.dateColumnTitle, { color: colors.textMuted }]}>
        {title}
      </AppText>

      <FlatList
        data={data}
        keyExtractor={(item, index) =>
          String(getValue ? getValue(item) : (item ?? index))
        }
        showsVerticalScrollIndicator={false}
        style={styles.dateColumnList}
        renderItem={({ item }) => {
          const itemValue = getValue ? getValue(item) : Number(item);
          const itemLabel = getLabel ? getLabel(item) : String(item);
          const selected = value === itemValue;

          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onSelect(itemValue)}
              style={[
                styles.dateOption,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : "transparent",
                },
              ]}
            >
              <AppText
                numberOfLines={1}
                style={[
                  styles.dateOptionText,
                  { color: selected ? "#FFFFFF" : colors.text },
                ]}
              >
                {itemLabel}
              </AppText>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function CountryOptionModal({
  visible,
  options,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  options: CountryOption[];
  value: string;
  onClose: () => void;
  onSelect: (option: CountryOption) => void;
}) {
  const { colors } = useAppTheme();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(normalizedQuery) ||
        option.callingCode.includes(normalizedQuery),
    );
  }, [options, query]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View
            style={[styles.modalGrabber, { backgroundColor: colors.border }]}
          />

          <View style={styles.modalHeader}>
            <AppText style={[styles.modalTitle, { color: colors.text }]}>
              Select country
            </AppText>

            <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
              <AppText style={[styles.modalClose, { color: colors.primary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
            <Search color={colors.textSoft} size={17} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or code"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.isoCode}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = value === item.name;

              return (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => onSelect(item)}
                  style={[styles.optionRow, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.countryOptionLeft}>
                    <FlagImage isoCode={item.isoCode} size={26} />
                    <AppText
                      numberOfLines={1}
                      style={[
                        styles.optionText,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {item.name}
                    </AppText>
                  </View>

                  <AppText
                    style={[
                      styles.callingCodeText,
                      { color: selected ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {item.callingCode}
                  </AppText>
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function OptionModal({
  title,
  visible,
  options,
  value,
  emptyText,
  onClose,
  onSelect,
}: {
  title: string;
  visible: boolean;
  options: LocationOption[];
  value: string;
  emptyText: string;
  onClose: () => void;
  onSelect: (option: LocationOption) => void;
}) {
  const { colors } = useAppTheme();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.name.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View
            style={[styles.modalGrabber, { backgroundColor: colors.border }]}
          />

          <View style={styles.modalHeader}>
            <AppText style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </AppText>

            <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
              <AppText style={[styles.modalClose, { color: colors.primary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
            <Search color={colors.textSoft} size={17} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AppText style={{ color: colors.textMuted, fontSize: 13 }}>
                  {emptyText}
                </AppText>
              </View>
            }
            renderItem={({ item }) => {
              const selected = value === item.name;

              return (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => onSelect(item)}
                  style={[styles.optionRow, { borderBottomColor: colors.border }]}
                >
                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.optionText,
                      { color: selected ? colors.primary : colors.text },
                    ]}
                  >
                    {item.name}
                  </AppText>

                  {selected ? (
                    <CheckCircle2 color={colors.primary} size={18} />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width <= 360;

  const { colors, isDark } = useAppTheme();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = React.useState<1 | 2>(1);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [phone, setPhone] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+234");
  const [countryIso, setCountryIso] = React.useState("NG");
  const [country, setCountry] = React.useState("Nigeria");
  const [state, setState] = React.useState("");
  const [stateCode, setStateCode] = React.useState("");
  const [city, setCity] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | null>(null);
  const [dob, setDob] = React.useState("");

  const [countryPickerOpen, setCountryPickerOpen] = React.useState(false);
  const [statePickerOpen, setStatePickerOpen] = React.useState(false);
  const [cityPickerOpen, setCityPickerOpen] = React.useState(false);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const formOpacity = React.useRef(new Animated.Value(0)).current;
  const formTranslateY = React.useRef(new Animated.Value(22)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 460,
        useNativeDriver: true,
      }),
      Animated.spring(formTranslateY, {
        toValue: 0,
        damping: 17,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [formOpacity, formTranslateY]);

  const maximumBirthDate = React.useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    return date;
  }, []);

  const stateOptions = React.useMemo<LocationOption[]>(() => {
    return CSState.getStatesOfCountry(countryIso).map((item) => ({
      name: item.name,
      code: item.isoCode,
    }));
  }, [countryIso]);

  const cityOptions = React.useMemo<LocationOption[]>(() => {
    if (!stateCode) return [];

    return CSCity.getCitiesOfState(countryIso, stateCode).map((item) => ({
      name: item.name,
      code: `${item.name}-${item.latitude}-${item.longitude}`,
    }));
  }, [countryIso, stateCode]);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const step1Valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    Object.values(passwordRules).every(Boolean);

  const step2Valid =
    phone.trim().length > 0 &&
    countryCode.trim().length > 0 &&
    country.trim().length > 0 &&
    state.trim().length > 0 &&
    city.trim().length > 0 &&
    dob.trim().length > 0;

  const handleCountrySelect = (selectedCountry: CountryOption) => {
    setCountryIso(selectedCountry.isoCode);
    setCountryCode(selectedCountry.callingCode);
    setCountry(selectedCountry.name);
    setState("");
    setStateCode("");
    setCity("");
    clearError();
  };

  const handleNativeDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS !== "ios") {
      setDatePickerOpen(false);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    setDateOfBirth(selectedDate);
    setDob(formatDateForApi(selectedDate));
    clearError();
  };

  const handleWebDateSelect = (selectedDate: Date) => {
    setDateOfBirth(selectedDate);
    setDob(formatDateForApi(selectedDate));
    setDatePickerOpen(false);
    clearError();
  };

  const handleNext = () => {
    if (!step1Valid) return;
    clearError();
    setStep(2);
  };

  const handleRegister = async () => {
    if (!step2Valid) return;

    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone_number: phone.trim(),
        country_code: countryCode.trim(),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        date_of_birth: dob.trim(),
      });

      router.push(
        `/auth/verify-otp?email=${email.trim().toLowerCase()}` as Href,
      );
    } catch {}
  };

  const highlight = isDark ? HIGHLIGHT.dark : HIGHLIGHT.light;

  return (
    <AppScreen
      contentStyle={[
        styles.content,
        isCompact ? styles.contentCompact : undefined,
      ]}
    >
      <Animated.View
        style={{
          opacity: formOpacity,
          transform: [{ translateY: formTranslateY }],
        }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => (step === 2 ? setStep(1) : router.back())}
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
            activeOpacity={0.75}
          >
            <ChevronLeft color={colors.text} size={22} />
          </TouchableOpacity>

          <TelifierLogo size="sm" />

          <View style={styles.topSpacer} />
        </View>

        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.glass, borderColor: colors.glassBorder },
            ]}
          >
            <Sparkles color={highlight} size={13} />
            <AppText style={[styles.badgeText, { color: colors.textMuted }]}>
              JOIN TELEFYA
            </AppText>
          </View>

          <StepIndicator step={step} colors={colors} />

          <AppText style={[styles.title, { color: colors.text }]}>
            {step === 1 ? "Create your account." : "Complete your profile."}
          </AppText>

          <AppText style={[styles.subtitle, { color: colors.textMuted }]}>
            {step === 1
              ? "Sign up to get started with Telefya."
              : "Just a few more details."}
          </AppText>
        </View>

        {step === 1 ? (
          <>
            <View style={styles.fields}>
              <View style={[styles.nameRow, isCompact && styles.stackRow]}>
                <AppTextInput
                  label="First name"
                  placeholder="Enter first name"
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={(v) => {
                    setFirstName(v);
                    clearError();
                  }}
                  leftSlot={<UserRound color={colors.textSoft} size={18} />}
                  containerStyle={[
                    styles.inputContainer,
                    styles.nameInput,
                    { backgroundColor: colors.surface },
                  ]}
                />

                <AppTextInput
                  label="Last name"
                  placeholder="Enter last name"
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={(v) => {
                    setLastName(v);
                    clearError();
                  }}
                  leftSlot={<UserRound color={colors.textSoft} size={18} />}
                  containerStyle={[
                    styles.inputContainer,
                    styles.nameInput,
                    { backgroundColor: colors.surface },
                  ]}
                />
              </View>

              <AppTextInput
                label="Email address"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearError();
                }}
                leftSlot={<Mail color={colors.textSoft} size={18} />}
                containerStyle={[
                  styles.inputContainer,
                  { backgroundColor: colors.surface },
                ]}
              />

              <AppTextInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  clearError();
                }}
                secureTextEntry={!showPassword}
                leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
                rightSlot={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    activeOpacity={0.75}
                  >
                    {showPassword ? (
                      <EyeOff color={colors.textSoft} size={18} />
                    ) : (
                      <Eye color={colors.textSoft} size={18} />
                    )}
                  </TouchableOpacity>
                }
                containerStyle={[
                  styles.inputContainer,
                  { backgroundColor: colors.surface },
                ]}
              />

              <AppTextInput
                label="Confirm password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  clearError();
                }}
                secureTextEntry={!showConfirmPassword}
                leftSlot={<LockKeyhole color={colors.textSoft} size={18} />}
                rightSlot={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    activeOpacity={0.75}
                  >
                    {showConfirmPassword ? (
                      <EyeOff color={colors.textSoft} size={18} />
                    ) : (
                      <Eye color={colors.textSoft} size={18} />
                    )}
                  </TouchableOpacity>
                }
                containerStyle={[
                  styles.inputContainer,
                  { backgroundColor: colors.surface },
                ]}
              />
            </View>

            <View
              style={[
                styles.passwordPanel,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <AppText style={[styles.passwordTitle, { color: colors.text }]}>
                Password must include:
              </AppText>

              <View style={styles.rulesGrid}>
                <PasswordRule
                  passed={passwordRules.length}
                  label="8+ characters"
                />
                <PasswordRule
                  passed={passwordRules.uppercase}
                  label="Uppercase letter"
                />
                <PasswordRule passed={passwordRules.number} label="Number" />
                <PasswordRule
                  passed={passwordRules.special}
                  label="Special character"
                />
                <PasswordRule
                  passed={passwordRules.match}
                  label="Passwords match"
                />
              </View>
            </View>

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: `${colors.danger}14`,
                    borderColor: colors.danger,
                  },
                ]}
              >
                <AppText style={[styles.errorText, { color: colors.danger }]}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <AppButton
              title="Continue"
              variant="gradient"
              gradientColors={BRAND_GRADIENT}
              contentAlign="spaceBetween"
              rightIcon={<ArrowRight color="#FFFFFF" size={18} />}
              disabled={!step1Valid}
              onPress={handleNext}
            />
          </>
        ) : (
          <>
            <View style={styles.fields}>
              <View style={[styles.phoneRow, isCompact && styles.stackRow]}>
                <FieldGroup
                  label="Country code"
                  style={isCompact ? styles.stackRow : styles.countryCodeGroup}
                >
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setCountryPickerOpen(true)}
                    style={[
                      styles.countryCodeButton,
                      isCompact && styles.countryCodeCompact,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <FlagImage isoCode={countryIso} size={24} />

                    <AppText
                      numberOfLines={1}
                      style={[styles.countryCodeText, { color: colors.text }]}
                    >
                      {countryCode}
                    </AppText>

                    <ChevronDown color={colors.textSoft} size={16} />
                  </TouchableOpacity>
                </FieldGroup>

                <AppTextInput
                  label="Phone number"
                  placeholder="Enter phone number"
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v);
                    clearError();
                  }}
                  keyboardType="phone-pad"
                  leftSlot={<Phone color={colors.textSoft} size={18} />}
                  containerStyle={[
                    styles.inputContainer,
                    { backgroundColor: colors.surface },
                  ]}
                  style={styles.phoneInput}
                />
              </View>

              <SelectField
                label="Date of birth"
                value={dob}
                placeholder="Select date"
                leftSlot={<Calendar color={colors.textSoft} size={18} />}
                onPress={() => setDatePickerOpen(true)}
              />

              {datePickerOpen && Platform.OS !== "web" ? (
                <DateTimePicker
                  value={dateOfBirth ?? maximumBirthDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={maximumBirthDate}
                  onChange={handleNativeDateChange}
                />
              ) : null}

              <SelectField
                label="Country"
                value={country}
                placeholder="Select country"
                leftSlot={<FlagImage isoCode={countryIso} size={24} />}
                onPress={() => setCountryPickerOpen(true)}
              />

              <SelectField
                label="State / Region"
                value={state}
                placeholder={
                  country ? "Select state or region" : "Select country first"
                }
                disabled={!country}
                leftSlot={<MapPin color={colors.textSoft} size={18} />}
                onPress={() => setStatePickerOpen(true)}
              />

              <SelectField
                label="City"
                value={city}
                placeholder={state ? "Select city" : "Select state first"}
                disabled={!state}
                leftSlot={<MapPin color={colors.textSoft} size={18} />}
                onPress={() => setCityPickerOpen(true)}
              />
            </View>

            <WebDatePickerModal
              visible={datePickerOpen && Platform.OS === "web"}
              value={dateOfBirth}
              maximumDate={maximumBirthDate}
              onClose={() => setDatePickerOpen(false)}
              onSelect={handleWebDateSelect}
            />

            <CountryOptionModal
              visible={countryPickerOpen}
              options={countryOptions}
              value={country}
              onClose={() => setCountryPickerOpen(false)}
              onSelect={(option) => {
                handleCountrySelect(option);
                setCountryPickerOpen(false);
              }}
            />

            <OptionModal
              title="Select state or region"
              visible={statePickerOpen}
              options={stateOptions}
              value={state}
              emptyText="No states found for this country."
              onClose={() => setStatePickerOpen(false)}
              onSelect={(option) => {
                setState(option.name);
                setStateCode(option.code);
                setCity("");
                clearError();
                setStatePickerOpen(false);
              }}
            />

            <OptionModal
              title="Select city"
              visible={cityPickerOpen}
              options={cityOptions}
              value={city}
              emptyText="No cities found for this state."
              onClose={() => setCityPickerOpen(false)}
              onSelect={(option) => {
                setCity(option.name);
                clearError();
                setCityPickerOpen(false);
              }}
            />

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: `${colors.danger}14`,
                    borderColor: colors.danger,
                  },
                ]}
              >
                <AppText style={[styles.errorText, { color: colors.danger }]}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <AppButton
              title="Create account"
              variant="gradient"
              gradientColors={BRAND_GRADIENT}
              contentAlign="spaceBetween"
              rightIcon={<ArrowRight color="#FFFFFF" size={18} />}
              disabled={!step2Valid || isLoading}
              loading={isLoading}
              onPress={handleRegister}
            />
          </>
        )}

        <View style={styles.footer}>
          <AppText style={[styles.footerText, { color: colors.textMuted }]}>
            Already have a Telefya account?
          </AppText>

          <Link href="/auth/login" asChild>
            <TouchableOpacity activeOpacity={0.75}>
              <AppText style={[styles.authLink, { color: colors.primary }]}>
                Sign in
              </AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "flex-start",
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  contentCompact: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topSpacer: { width: 44 },
  header: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 30,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  stepWrap: {
    gap: Spacing.two,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "900",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  stepLine: {
    flex: 1,
    height: 4,
    marginHorizontal: 7,
    borderRadius: 999,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    maxWidth: 430,
    fontSize: 14,
    lineHeight: 21,
  },
  fields: {
    width: "100%",
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  fieldGroup: {
    width: "100%",
    gap: 7,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 2,
  },
  nameRow: {
    flexDirection: "column",
    gap: Spacing.three,
  },
  stackRow: {
    flexDirection: "column",
  },
  nameInput: {
    width: "100%",
  },
  phoneRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  countryCodeGroup: {
    width: 126,
  },
  countryCodeButton: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  countryCodeCompact: {
    width: "100%",
    justifyContent: "flex-start",
  },
  countryCodeText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  phoneInput: {
    fontSize: 16,
  },
  inputContainer: {
    width: "100%",
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 0,
  },
  selectField: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  selectLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: "700",
  },
  flagImage: {
    borderRadius: 4,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
  },
  passwordPanel: {
    gap: Spacing.three,
    marginTop: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.four,
  },
  passwordTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  rulesGrid: {
    gap: Spacing.two,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  ruleText: { fontSize: 12, fontWeight: "600" },
  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },
  errorText: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    marginTop: Spacing.five,
  },
  footerText: { fontSize: 12, fontWeight: "600" },
  authLink: {
    fontSize: 12,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 24, 0.55)",
  },
  modalSheet: {
    maxHeight: "86%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalGrabber: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    marginBottom: 2,
  },
  modalHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 15, fontWeight: "800" },
  modalClose: {
    fontWeight: "900",
  },
  searchBox: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  optionRow: {
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  countryOptionLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  callingCodeText: {
    fontSize: 14,
    fontWeight: "900",
  },
  emptyState: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerGrid: {
    height: 250,
    flexDirection: "row",
    gap: 8,
  },
  dateColumn: {
    flex: 1,
    minWidth: 0,
  },
  dateColumnTitle: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 12,
  },
  dateColumnList: {
    flex: 1,
  },
  dateOption: {
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 1,
    marginBottom: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  dateOptionText: {
    fontSize: 13,
    fontWeight: "900",
  },
});