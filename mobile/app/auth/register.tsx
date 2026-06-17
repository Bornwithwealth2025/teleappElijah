import React from "react";
import useAuthStore from "@/store/authStore";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Link, router, type Href } from "expo-router";
import countries from "world-countries";
import {
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
  UserRound,
} from "lucide-react-native";
import {
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
import { useSocialAuth } from "@/hooks/useSocialAuth";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";

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

function GoogleLogo() {
  return <FontAwesome name="google" size={20} color="#4285F4" />;
}

function AppleLogo({ color }: { color: string }) {
  return <FontAwesome name="apple" size={22} color={color} />;
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
        variant="caption"
        style={{ color: passed ? colors.success : colors.textMuted }}
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
          variant="caption"
          style={[
            styles.stepLabel,
            { color: step === 1 ? colors.primary : colors.textMuted },
          ]}
        >
          Account
        </AppText>
        <AppText
          variant="caption"
          style={[
            styles.stepLabel,
            { color: step === 2 ? colors.primary : colors.textMuted },
          ]}
        >
          Profile
        </AppText>
      </View>

      <View style={styles.stepRow}>
        <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
        <View
          style={[
            styles.stepLine,
            { backgroundColor: step === 2 ? colors.primary : colors.border },
          ]}
        />
        <View
          style={[
            styles.stepDot,
            { backgroundColor: step === 2 ? colors.primary : colors.border },
          ]}
        />
      </View>
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
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.selectField,
        {
          borderColor: colors.border,
          backgroundColor: disabled ? colors.surface : colors.card,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.selectLeft}>
        {leftSlot}

        <View style={styles.selectTextWrap}>
          <AppText
            variant="caption"
            style={[styles.selectLabel, { color: colors.textMuted }]}
          >
            {label}
          </AppText>

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
      </View>

      <ChevronDown color={colors.textSoft} size={18} />
    </TouchableOpacity>
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <AppText variant="bodyStrong" style={{ color: colors.text }}>
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
            onPress={handleDone}
            style={styles.modalButton}
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
      <AppText
        variant="caption"
        style={[styles.dateColumnTitle, { color: colors.textMuted }]}
      >
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
                  borderColor: selected ? colors.primary : colors.border,
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <AppText variant="bodyStrong" style={{ color: colors.text }}>
              Select country
            </AppText>

            <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
              <AppText style={[styles.modalClose, { color: colors.primary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchBox,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
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
                  style={[
                    styles.optionRow,
                    { borderBottomColor: colors.border },
                  ]}
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <AppText variant="bodyStrong" style={{ color: colors.text }}>
              {title}
            </AppText>

            <TouchableOpacity activeOpacity={0.75} onPress={onClose}>
              <AppText style={[styles.modalClose, { color: colors.primary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchBox,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
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
                <AppText variant="caption" tone="muted">
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
                  style={[
                    styles.optionRow,
                    { borderBottomColor: colors.border },
                  ]}
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

  const { colors } = useAppTheme();
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
  const { googleReady, appleAvailable, signInWithGoogle, signInWithApple } =
    useSocialAuth();

  const [countryPickerOpen, setCountryPickerOpen] = React.useState(false);
  const [statePickerOpen, setStatePickerOpen] = React.useState(false);
  const [cityPickerOpen, setCityPickerOpen] = React.useState(false);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

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

  return (
    <AppScreen
      contentStyle={[
        styles.content,
        isCompact ? styles.contentCompact : undefined,
      ]}
    >
      <TouchableOpacity
        onPress={() => (step === 2 ? setStep(1) : router.back())}
        style={[
          styles.backBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        activeOpacity={0.75}
      >
        <ChevronLeft color={colors.text} size={22} />
      </TouchableOpacity>

      <View style={styles.header}>
        <StepIndicator step={step} colors={colors} />

        <AppText
          variant="display"
          style={[styles.title, isCompact && styles.titleCompact]}
        >
          {step === 1 ? "Create account" : "Profile details"}
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.subtitle}>
          {step === 1
            ? "Set up your login details."
            : "Complete your contact and location profile."}
        </AppText>
      </View>

      {step === 1 ? (
        <>
          <View style={styles.fields}>
            <View style={[styles.nameRow, isCompact && styles.stackRow]}>
              <AppTextInput
                placeholder="First name"
                autoCapitalize="words"
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  clearError();
                }}
                leftSlot={<UserRound color={colors.textSoft} size={18} />}
                containerStyle={[styles.inputContainer, styles.nameInput]}
                style={styles.input}
              />

              <AppTextInput
                placeholder="Last name"
                autoCapitalize="words"
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  clearError();
                }}
                leftSlot={<UserRound color={colors.textSoft} size={18} />}
                containerStyle={[styles.inputContainer, styles.nameInput]}
                style={styles.input}
              />
            </View>

            <AppTextInput
              placeholder="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clearError();
              }}
              leftSlot={<Mail color={colors.textSoft} size={18} />}
              containerStyle={styles.inputContainer}
              style={styles.input}
            />

            <AppTextInput
              placeholder="Password"
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
              containerStyle={styles.inputContainer}
              style={styles.input}
            />

            <AppTextInput
              placeholder="Confirm password"
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
              containerStyle={styles.inputContainer}
              style={styles.input}
            />
          </View>

          <View
            style={[
              styles.passwordPanel,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppText
              variant="caption"
              style={[styles.passwordTitle, { color: colors.text }]}
            >
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
            <AppText
              variant="caption"
              style={{ color: colors.danger, textAlign: "center" }}
            >
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Continue"
            disabled={!step1Valid}
            onPress={handleNext}
            style={styles.primaryButton}
          />
        </>
      ) : (
        <>
          <View style={styles.fields}>
            <View style={[styles.phoneRow, isCompact && styles.stackRow]}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setCountryPickerOpen(true)}
                style={[
                  styles.countryCodeButton,
                  isCompact && styles.countryCodeCompact,
                  { backgroundColor: colors.card, borderColor: colors.border },
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

              <AppTextInput
                placeholder="Phone number"
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  clearError();
                }}
                keyboardType="phone-pad"
                leftSlot={<Phone color={colors.textSoft} size={18} />}
                containerStyle={[styles.inputContainer, styles.phoneInput]}
                style={styles.input}
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
            <AppText
              variant="caption"
              style={{ color: colors.danger, textAlign: "center" }}
            >
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Create account"
            disabled={!step2Valid || isLoading}
            onPress={handleRegister}
            loading={isLoading}
            style={styles.primaryButton}
          />
        </>
      )}

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <AppText variant="caption" tone="muted" style={styles.dividerLabel}>
          Or continue with
        </AppText>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.socialStack}>
        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.75}
          disabled={!googleReady || isLoading}
          onPress={signInWithGoogle}
        >
          <GoogleLogo />
          <AppText
            variant="bodyStrong"
            style={[styles.socialLabel, { color: colors.text }]}
          >
            Continue with Google
          </AppText>
        </TouchableOpacity>

        {appleAvailable ? (
          <TouchableOpacity
            style={[
              styles.socialBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            activeOpacity={0.75}
            disabled={isLoading}
            onPress={signInWithApple}
          >
            <AppleLogo color={colors.text} />
            <AppText
              variant="bodyStrong"
              style={[styles.socialLabel, { color: colors.text }]}
            >
              Continue with Apple
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" tone="muted">
          Already have an account?
        </AppText>

        <Link href="/auth/login" asChild>
          <TouchableOpacity activeOpacity={0.75}>
            <AppText
              variant="caption"
              style={[styles.authLink, { color: colors.primary }]}
            >
              Sign In.
            </AppText>
          </TouchableOpacity>
        </Link>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 580,
    justifyContent: "flex-start",
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  contentCompact: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  header: {
    gap: Spacing.three,
  },
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
    width: 11,
    height: 11,
    borderRadius: 999,
  },
  stepLine: {
    flex: 1,
    height: 4,
    marginHorizontal: 7,
    borderRadius: 999,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  titleCompact: {
    fontSize: 29,
    lineHeight: 35,
  },
  subtitle: {
    maxWidth: 390,
    lineHeight: 21,
  },
  fields: {
    gap: Spacing.three,
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
  countryCodeButton: {
    width: 124,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
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
    flex: 1,
    minWidth: 0,
  },
  inputContainer: {
    width: "100%",
    minHeight: 58,
    borderRadius: 16,
  },
  input: {
    fontSize: 16,
  },
  selectField: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 1,
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
  selectTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  selectLabel: {
    marginBottom: 3,
    fontSize: 11,
    fontWeight: "900",
  },
  selectValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  flagImage: {
    borderRadius: 4,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
  },
  passwordPanel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  passwordTitle: {
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
  primaryButton: {
    minHeight: 58,
    borderRadius: 999,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    flexShrink: 0,
  },
  socialStack: {
    gap: Spacing.three,
  },
  socialBtn: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  socialLabel: {
    flexShrink: 1,
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  authLink: {
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  modalSheet: {
    maxHeight: "84%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalClose: {
    fontWeight: "900",
  },
  searchBox: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  optionRow: {
    minHeight: 54,
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
    height: 240,
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
  },
  dateColumnList: {
    flex: 1,
  },
  dateOption: {
    minHeight: 38,
    borderRadius: 12,
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
  modalButton: {
    minHeight: 52,
    borderRadius: 999,
  },
});