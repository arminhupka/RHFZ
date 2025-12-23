import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import {
    DefaultValues,
    FieldValues,
    FormProvider,
    SubmitHandler,
    useForm,
} from 'react-hook-form'
import { ZodEffects, ZodObject } from 'zod/v3'

interface IRHPZDefaultData<FormResponse = unknown> {
    isSubmitting: boolean
    isSubmittedSuccessfully: boolean
    isSubmitError: boolean
    formResponse?: FormResponse | null
}

const RHZProviderDefaultData: IRHPZDefaultData = {
    isSubmitting: false,
    isSubmittedSuccessfully: false,
    isSubmitError: false,
    formResponse: null,
}

const RHZPContext = createContext<IRHPZDefaultData<unknown>>(
    RHZProviderDefaultData
)

export const useRHZPContex = <FormResponse = unknown,>() =>
    useContext(RHZPContext) as IRHPZDefaultData<FormResponse>

interface IRHFZProviderProps<FormFields, FormResponse, FormReject> {
    schema: ZodEffects<ZodObject<any>> | ZodObject<any> | any
    defaultValues: DefaultValues<FormFields>
    children: ReactNode
    reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit' | undefined
    onSubmit: (formData: FormFields) => Promise<FormResponse>
    onSuccess?: (
        reponse: FormResponse,
        formData: FormFields
    ) => void | Promise<void>
    onError?: (reject: FormReject, formData: FormFields) => void | Promise<void>
    onDone?: (formData: FormFields) => void | Promise<void>
}

export const RHFZProvider = <
    FormField extends FieldValues,
    FormResponse extends unknown = undefined,
    FormReject extends unknown = undefined,
>({
    children,
    defaultValues,
    schema,
    reValidateMode,
    onSubmit,
    onError,
    onSuccess,
    onDone,
}: IRHFZProviderProps<FormField, FormResponse, FormReject>) => {
    const [formState, setFormState] = useState<IRHPZDefaultData<FormResponse>>({
        isSubmitting: false,
        isSubmittedSuccessfully: false,
        isSubmitError: false,
        formResponse: null,
    })

    const form = useForm<FormField>({
        defaultValues,
        resolver: zodResolver(schema),
        reValidateMode,
    })

    const handler: SubmitHandler<FormField> = (data) => {
        setFormState((prev) => ({
            ...prev,
            isSubmitting: true,
            isSubmittedSuccessfully: false,
            isSubmitError: false,
            formResponse: null,
        }))
        onSubmit(data)
            .then((response) => {
                setFormState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    isSubmittedSuccessfully: true,
                    formResponse: response,
                }))
                onSuccess?.(response, data)
            })
            .catch((error) => {
                setFormState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    isSubmitError: true,
                }))
                onError?.(error, data)
            })
            .finally(() => {
                setFormState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                }))
                onDone?.(data)
            })
    }

    const value = useMemo<IRHPZDefaultData>(
        () => ({
            ...formState,
        }),
        [formState]
    )

    return (
        <RHZPContext.Provider value={value}>
            <FormProvider {...form}>
                <form noValidate={true} onSubmit={form.handleSubmit(handler)}>
                    {children}
                </form>
            </FormProvider>
        </RHZPContext.Provider>
    )
}
