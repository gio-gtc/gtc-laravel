<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Support either a single "name" field (existing page)
            // or a split first/last name (user info modal).
            'name' => ['required_without_all:first_name,last_name', 'string', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255', 'required_with:last_name'],
            'last_name' => ['nullable', 'string', 'max:255', 'required_with:first_name'],
            'organization' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'about_me' => ['nullable', 'string', 'max:2000'],
            'out_of_office' => ['nullable', 'boolean'],
            'out_of_office_start_date' => [
                'nullable',
                'date',
                'required_if:out_of_office,1',
            ],
            'out_of_office_end_date' => [
                'nullable',
                'date',
                'required_if:out_of_office,1',
                'after_or_equal:out_of_office_start_date',
            ],
            'photo' => ['nullable', 'image', 'max:2048'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}
