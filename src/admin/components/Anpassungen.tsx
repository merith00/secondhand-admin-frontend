import { useEffect, useState } from 'react';

import {
    fetchItemOptions,
    createItemOption,
    deleteItemOption,
} from '../../api/adminApi';

import type {
    ItemOption,
    ItemOptionType,
} from '../../types';


const optionGroups: {
    type: ItemOptionType;
    title: string;
    placeholder: string;
}[] = [
        {
            type: 'category',
            title: 'Kategorien',
            placeholder: 'Neue Kategorie',
        },
        {
            type: 'size',
            title: 'Größen',
            placeholder: 'Neue Größe',
        },
        {
            type: 'brand',
            title: 'Marken',
            placeholder: 'Neue Marke',
        },
        {
            type: 'color',
            title: 'Farben',
            placeholder: 'Neue Farbe',
        },
    ];


export default function Anpassungen() {
    const [options, setOptions] = useState<ItemOption[]>([]);

    const [newValues, setNewValues] = useState<
        Record<ItemOptionType, string>
    >({
        category: '',
        size: '',
        brand: '',
        color: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    async function loadOptions() {
        try {
            setLoading(true);
            setError('');

            const data = await fetchItemOptions();

            setOptions(data);
        } catch (err: any) {
            setError(
                err.message || 'Anpassungen konnten nicht geladen werden'
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadOptions();
    }, []);


    async function handleAdd(type: ItemOptionType) {
        const value = newValues[type].trim();

        if (!value) {
            return;
        }

        try {
            setError('');

            await createItemOption({
                type,
                value,
            });

            setNewValues((prev) => ({
                ...prev,
                [type]: '',
            }));

            await loadOptions();
        } catch (err: any) {
            setError(
                err.message || 'Eintrag konnte nicht hinzugefügt werden'
            );
        }
    }


    async function handleDelete(option: ItemOption) {
        const confirmed = window.confirm(
            `"${option.value}" wirklich löschen?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError('');

            await deleteItemOption(option.id);

            await loadOptions();
        } catch (err: any) {
            setError(
                err.message || 'Eintrag konnte nicht gelöscht werden'
            );
        }
    }


    if (loading) {
        return (
            <div className="content-grid adjustments-page">
                <h2>Anpassungen</h2>
                <p>Wird geladen...</p>
            </div>
        );
    }


    return (
        <div className="content-grid adjustments-page">
            <h2>Anpassungen</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {optionGroups.map((group) => {
                const groupOptions = options.filter(
                    (option) => option.type === group.type
                );

                return (
                    <section className="card" key={group.type}>
                        <div className="option-card-header">
                            <h3>{group.title}</h3>

                            <span className="option-count">
                                {groupOptions.length}
                            </span>
                        </div>
                        <div className="option-add-row">
                            <input
                                type="text"
                                placeholder={group.placeholder}
                                value={newValues[group.type]}
                                onChange={(e) =>
                                    setNewValues((prev) => ({
                                        ...prev,
                                        [group.type]: e.target.value,
                                    }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAdd(group.type);
                                    }
                                }}
                            />

                            <button
                                type="button"
                                className="primary-btn"
                                onClick={() => handleAdd(group.type)}
                            >
                                Hinzufügen
                            </button>
                        </div>

                        <div className="option-list">
                            {groupOptions.length === 0 && (
                                <p>Noch keine Einträge vorhanden.</p>
                            )}

                            {groupOptions.map((option) => (
                                <div
                                    className="option-list-item"
                                    key={option.id}
                                >
                                    <span>{option.value}</span>

                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDelete(option)}
                                    >
                                        Löschen
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}