import { Controller, useFormContext } from "react-hook-form";
import { useMemo } from "react";

import { State, City } from "country-state-city";
import Select from "react-select";

import type { RegisterFormData } from "../../schemas/registerSchema";

import Input from "../ui/Input";
import FormField from "../ui/FormField";
import CustomSelect from "../ui/Select";

import {
  genders,
  occupations,
  incomeRanges,
} from "../../constants/registerOptions";

export default function BasicInfoStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RegisterFormData>();

  const selectedState = watch("state");

  const states = useMemo(
    () =>
      State.getStatesOfCountry("IN").map((state) => ({
        value: state.isoCode,
        label: state.name,
      })),
    []
  );

  const cities = useMemo(() => {
    if (!selectedState) return [];

    return City.getCitiesOfState("IN", selectedState).map((city) => ({
      value: city.name,
      label: city.name,
    }));
  }, [selectedState]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Personal Information
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Tell us a little about yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label="First Name"
          htmlFor="firstName"
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            placeholder="John"
            hasError={!!errors.firstName}
            {...register("firstName")}
          />
        </FormField>

        <FormField
          label="Last Name"
          htmlFor="lastName"
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            placeholder="Doe"
            hasError={!!errors.lastName}
            {...register("lastName")}
          />
        </FormField>

        <FormField
          label="Date of Birth"
          htmlFor="dob"
          error={errors.dob?.message}
        >
          <Input
            id="dob"
            type="date"
            hasError={!!errors.dob}
            {...register("dob")}
          />
        </FormField>

        <FormField
          label="Gender"
          htmlFor="gender"
          error={errors.gender?.message}
        >
          <CustomSelect
            id="gender"
            {...register("gender")}
            options={genders}
          />
        </FormField>

        <FormField
          label="Occupation"
          htmlFor="occupation"
          error={errors.occupation?.message}
        >
          <CustomSelect
            id="occupation"
            {...register("occupation")}
            options={occupations}
          />
        </FormField>

        <FormField
          label="Annual Income"
          htmlFor="annualIncome"
          error={errors.annualIncome?.message}
        >
          <CustomSelect
            id="annualIncome"
            {...register("annualIncome")}
            options={incomeRanges}
          />
        </FormField>

        {/* STATE */}

        <FormField
          label="State"
          htmlFor="state"
          error={errors.state?.message}
        >
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select
                options={states}
                placeholder="Select State"
                isSearchable
                value={
                  states.find(
                    (state) => state.value === field.value
                  ) || null
                }
                onChange={(option) => {
                  field.onChange(option?.value || "");

                  // Clear city whenever state changes
                  setValue("city", "");
                }}
              />
            )}
          />
        </FormField>

        {/* CITY */}

        <FormField
          label="City"
          htmlFor="city"
          error={errors.city?.message}
        >
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Select
                options={cities}
                placeholder="Select City"
                isSearchable
                isDisabled={!selectedState}
                value={
                  cities.find(
                    (city) => city.value === field.value
                  ) || null
                }
                onChange={(option) =>
                  field.onChange(option?.value || "")
                }
              />
            )}
          />
        </FormField>
      </div>
    </div>
  );
}