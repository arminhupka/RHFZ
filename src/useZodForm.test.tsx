import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RHFZProvider, useRHZPContex } from './useZodForm'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'

// Simple test component to use inside the provider
const TestForm = () => {
    const {
        register,
        formState: { errors },
    } = useFormContext()
    const {
        isSubmitting,
        isSubmittedSuccessfully,
        isSubmitError,
        formResponse,
    } = useRHZPContex()

    return (
        <div>
            <input {...register('name')} placeholder="Name" />
            {errors.name && (
                <span role="alert">{errors.name.message as string}</span>
            )}

            <button type="submit">Submit</button>

            {isSubmitting && <div>Loading...</div>}
            {isSubmittedSuccessfully && (
                <div>Success! Response: {JSON.stringify(formResponse)}</div>
            )}
            {isSubmitError && <div>Error occurred</div>}
        </div>
    )
}

describe('RHFZProvider', () => {
    const schema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
    })

    const defaultValues = {
        name: '',
    }

    it('renders children and allows typing', async () => {
        const user = userEvent.setup()
        render(
            <RHFZProvider
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={async () => {}}
            >
                <TestForm />
            </RHFZProvider>
        )

        const input = screen.getByPlaceholderText('Name')
        await user.type(input, 'John')
        expect(input).toHaveValue('John')
    })

    it('shows validation error when schema is not met', async () => {
        const user = userEvent.setup()
        render(
            <RHFZProvider
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={async () => {}}
            >
                <TestForm />
            </RHFZProvider>
        )

        const submitBtn = screen.getByText('Submit')
        await user.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                'Name must be at least 3 characters'
            )
        })
    })

    it('handles successful submission', async () => {
        const user = userEvent.setup()
        const onSubmitMock = vi.fn().mockResolvedValue({ id: 1 })
        const onSuccessMock = vi.fn()
        const onDoneMock = vi.fn()

        render(
            <RHFZProvider
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={onSubmitMock}
                onSuccess={onSuccessMock}
                onDone={onDoneMock}
            >
                <TestForm />
            </RHFZProvider>
        )

        const input = screen.getByPlaceholderText('Name')
        await user.type(input, 'Valid Name')

        const submitBtn = screen.getByText('Submit')
        await user.click(submitBtn)

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        expect(onSubmitMock).toHaveBeenCalledWith({ name: 'Valid Name' })
        expect(onSuccessMock).toHaveBeenCalledWith(
            { id: 1 },
            { name: 'Valid Name' }
        )
        expect(onDoneMock).toHaveBeenCalledWith({ name: 'Valid Name' })
        expect(
            screen.getByText('Success! Response: {"id":1}')
        ).toBeInTheDocument()
    })

    it('handles submission error', async () => {
        const user = userEvent.setup()
        const error = new Error('Submission failed')
        const onSubmitMock = vi.fn().mockRejectedValue(error)
        const onErrorMock = vi.fn()

        render(
            <RHFZProvider
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={onSubmitMock}
                onError={onErrorMock}
            >
                <TestForm />
            </RHFZProvider>
        )

        const input = screen.getByPlaceholderText('Name')
        await user.type(input, 'Valid Name')

        const submitBtn = screen.getByText('Submit')
        await user.click(submitBtn)

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        expect(onErrorMock).toHaveBeenCalledWith(error, { name: 'Valid Name' })
        expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })

    it('resets form logic when resetOnSuccess is true', async () => {
        const user = userEvent.setup()
        const onSubmitMock = vi.fn().mockResolvedValue({})

        render(
            <RHFZProvider
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={onSubmitMock}
                resetOnSuccess={true}
            >
                <TestForm />
            </RHFZProvider>
        )

        const input = screen.getByPlaceholderText('Name')
        await user.type(input, 'Valid Name')

        const submitBtn = screen.getByText('Submit')
        await user.click(submitBtn)

        await waitFor(() => {
            expect(input).toHaveValue('')
        })
    })

    it('updates isSubmitting state during submission', async () => {
        const user = userEvent.setup()
        // Delay resolution to catch the loading state
        const onSubmitMock = vi
            .fn()
            .mockImplementation(
                () =>
                    new Promise((resolve) => setTimeout(() => resolve({}), 100))
            )

        render(
            <RHFZProvider
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={onSubmitMock}
            >
                <TestForm />
            </RHFZProvider>
        )

        const input = screen.getByPlaceholderText('Name')
        await user.type(input, 'Valid Name')

        const submitBtn = screen.getByText('Submit')
        await user.click(submitBtn)

        expect(screen.getByText('Loading...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })
    })
})
